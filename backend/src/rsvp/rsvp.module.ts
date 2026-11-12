import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminGuard, WriteOriginGuard } from '../common/security.guards.js'
import { RateLimitService } from './rate-limit.service.js'
import { RsvpAdminController, RsvpController } from './rsvp.controller.js'
import { RateLimit, RateLimitSchema, Rsvp, RsvpSchema } from './rsvp.schema.js'
import { RsvpService } from './rsvp.service.js'

@Module({
  imports: [MongooseModule.forFeature([{ name: Rsvp.name, schema: RsvpSchema }, { name: RateLimit.name, schema: RateLimitSchema }])],
  controllers: [RsvpController, RsvpAdminController],
  providers: [RsvpService, RateLimitService, WriteOriginGuard, AdminGuard],
})
export class RsvpModule {}
