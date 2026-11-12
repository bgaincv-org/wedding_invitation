import { BadRequestException, ConflictException, Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { createHash, randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import type { Model } from 'mongoose'
import { Rsvp } from './rsvp.schema.js'
import { RateLimitService } from './rate-limit.service.js'
import { CreateRsvpDto } from './rsvp.dto.js'
import type { Environment } from '../config/environment.js'

@Injectable()
export class RsvpService implements OnModuleInit {
  constructor(@InjectModel(Rsvp.name) private readonly replies: Model<Rsvp>, private readonly config: ConfigService<Environment, true>, private readonly rates: RateLimitService) {}
  async onModuleInit() { await this.replies.init() }
  async create(input: CreateRsvpDto, ip: string) {
    if (!this.config.get('RSVP_ENABLED', { infer: true })) throw new ServiceUnavailableException()
    if (input.eventIds.some(id => !this.config.get('WEDDING_EVENT_IDS', { infer: true }).includes(id))) throw new BadRequestException()
    const payload = { name: input.name, email: input.email, attendance: input.attendance, guests: input.attendance === 'no' ? 0 : input.guests, note: input.note, consent: true, eventIds: input.attendance === 'no' ? [] : [...input.eventIds].sort() }
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    const prior = await this.replies.findOne({ requestId: input.requestId }).select('+payloadHash').lean().exec()
    if (prior) {
      if (prior.payloadHash !== payloadHash) throw new ConflictException()
      return { saved: true, receipt: prior.receipt, replayed: true }
    }
    await this.rates.consume(ip, 'rsvp')
    try {
      const reply = await this.replies.create({ ...payload, payloadHash, requestId: input.requestId, receipt: randomBytes(8).toString('hex').toUpperCase() })
      return { saved: true, receipt: reply.receipt, replayed: false }
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error
      const saved = await this.replies.findOne({ requestId: input.requestId }).select('+payloadHash').lean().exec()
      if (!saved) throw new ServiceUnavailableException()
      if (saved.payloadHash !== payloadHash) throw new ConflictException()
      return { saved: true, receipt: saved.receipt, replayed: true }
    }
  }
  async list(cursor?: string) {
    if (cursor && !/^[a-fA-F0-9]{24}$/.test(cursor)) throw new BadRequestException()
    const rows = await this.replies.find(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}).sort({ _id: -1 }).limit(101).select('receipt name email attendance guests note eventIds createdAt').lean().exec()
    const hasMore = rows.length > 100
    const selected = rows.slice(0, 100)
    const nextCursor = hasMore ? selected.at(-1)?._id.toString() : null
    return { replies: selected.map(({ _id: _id, ...reply }) => { void _id; return reply }), nextCursor }
  }
  async remove(receipt: string) {
    if (!/^[A-F0-9]{16}$/.test(receipt)) throw new BadRequestException()
    // Idempotent deletion reveals no additional guest information.
    await this.replies.deleteOne({ receipt }).exec()
    return { deleted: true }
  }
}
