import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

@Schema({ collection: 'rsvps', versionKey: false, timestamps: true })
export class Rsvp {
  @Prop({ required: true, unique: true, immutable: true }) requestId!: string
  @Prop({ required: true, unique: true, immutable: true }) receipt!: string
  @Prop({ required: true, select: false }) payloadHash!: string
  @Prop({ required: true, maxlength: 100 }) name!: string
  @Prop({ required: true, maxlength: 254 }) email!: string
  @Prop({ required: true, enum: ['yes', 'no', 'maybe'] }) attendance!: 'yes' | 'no' | 'maybe'
  @Prop({ required: true, min: 0, max: 6 }) guests!: number
  @Prop({ default: '', maxlength: 500 }) note!: string
  @Prop({ required: true }) consent!: boolean
  @Prop({ type: [String], default: [] }) eventIds!: string[]
  createdAt!: Date
  updatedAt!: Date
}
export type RsvpDocument = HydratedDocument<Rsvp>
export const RsvpSchema = SchemaFactory.createForClass(Rsvp)
RsvpSchema.index({ createdAt: -1, _id: -1 })

@Schema({ collection: 'rate_limits', versionKey: false })
export class RateLimit {
  @Prop({ required: true, unique: true }) key!: string
  @Prop({ required: true, default: 0 }) count!: number
  @Prop({ required: true }) expiresAt!: Date
}
export const RateLimitSchema = SchemaFactory.createForClass(RateLimit)
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
