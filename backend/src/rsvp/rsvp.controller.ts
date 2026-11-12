import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AdminGuard, WriteOriginGuard } from '../common/security.guards.js'
import { CreateRsvpDto } from './rsvp.dto.js'
import { RateLimitService } from './rate-limit.service.js'
import { RsvpService } from './rsvp.service.js'

@Controller('rsvp')
export class RsvpController {
  constructor(private readonly service: RsvpService) {}
  @Post() @UseGuards(WriteOriginGuard)
  async create(@Body() body: CreateRsvpDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.service.create(body, request.ip ?? request.socket.remoteAddress ?? 'unknown')
    response.status(result.replayed ? 200 : 201)
    return { saved: result.saved, receipt: result.receipt }
  }
}

@Controller('admin/rsvps')
@UseGuards(AdminGuard)
export class RsvpAdminController {
  constructor(private readonly service: RsvpService, private readonly rates: RateLimitService) {}
  @Get()
  async list(@Req() request: Request, @Query('cursor') cursor?: string) {
    await this.rates.consume(request.ip ?? 'unknown', 'admin')
    return this.service.list(cursor)
  }
  @Delete(':receipt')
  async remove(@Param('receipt') receipt: string, @Req() request: Request) {
    await this.rates.consume(request.ip ?? 'unknown', 'admin')
    return this.service.remove(receipt)
  }
}
