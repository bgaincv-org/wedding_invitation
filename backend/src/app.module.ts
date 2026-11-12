import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { validateEnvironment } from './config/environment.js'
import type { Environment } from './config/environment.js'
import { HealthController } from './health/health.controller.js'
import { RsvpModule } from './rsvp/rsvp.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, ignoreEnvFile: true, validate: validateEnvironment }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService<Environment, true>) => ({ uri: config.get('MONGODB_URI', { infer: true }), serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, maxPoolSize: 10, autoIndex: true, retryAttempts: 2, retryDelay: 1000, writeConcern: { w: 'majority' as const, j: true } }) }),
    RsvpModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
