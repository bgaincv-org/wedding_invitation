import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import type { Connection } from 'mongoose'

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get()
  async health() {
    if (this.connection.readyState !== 1 || !this.connection.db) throw new ServiceUnavailableException()
    await this.connection.db.command({ ping: 1 })
    return { status: 'ok' }
  }
}
