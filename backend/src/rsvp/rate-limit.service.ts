import { HttpException, Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { createHmac } from 'node:crypto'
import type { Model } from 'mongoose'
import { RateLimit } from './rsvp.schema.js'
import type { Environment } from '../config/environment.js'

@Injectable()
export class RateLimitService implements OnModuleInit {
  constructor(@InjectModel(RateLimit.name) private readonly limits: Model<RateLimit>, private readonly config: ConfigService<Environment, true>) {}
  async onModuleInit() { await this.limits.init() }
  async consume(ip: string, scope: 'rsvp' | 'admin') {
    const seconds = this.config.get('RATE_LIMIT_WINDOW_SECONDS', { infer: true })
    const window = Math.floor(Date.now() / (seconds * 1000))
    const key = createHmac('sha256', this.config.get('RATE_LIMIT_SECRET', { infer: true })).update(`${scope}:${window}:${ip}`).digest('hex')
    const expiresAt = new Date((window + 2) * seconds * 1000)
    let bucket: RateLimit | null
    try {
      bucket = await this.limits.findOneAndUpdate({ key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true, returnDocument: 'after' }).lean().exec()
    } catch (error) {
      // A concurrent first request can win the unique-key upsert; increment its bucket.
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error
      bucket = await this.limits.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { returnDocument: 'after' }).lean().exec()
    }
    const limit = scope === 'admin' ? 60 : this.config.get('RATE_LIMIT_MAX', { infer: true })
    if (!bucket || bucket.count > limit) throw new HttpException('Rate limited', 429)
  }
}
