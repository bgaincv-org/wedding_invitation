import 'reflect-metadata'
import { randomUUID } from 'node:crypto'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { json } from 'express'
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { AppModule } from './app.module.js'
import type { Environment } from './config/environment.js'
import { SafeLogger } from './common/safe-logger.js'
import { SafeHttpExceptionFilter } from './common/http-exception.filter.js'

export async function createApplication() {
  const logger = new SafeLogger(process.env.LOG_LEVEL === 'silent')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, logger, abortOnError: false })
  const config = app.get(ConfigService<Environment, true>)
  const origins = config.get('ALLOWED_ORIGINS', { infer: true })
  const proxy = config.get('TRUST_PROXY', { infer: true })
  app.set('trust proxy', proxy ? proxy.split(',').map(item => item.trim()) : false)
  app.disable('x-powered-by')
  app.setGlobalPrefix('api/v1')
  app.use(helmet())
  app.use((request: Request, response: Response, next: NextFunction) => {
    const started = performance.now()
    response.locals.requestId = randomUUID()
    response.setHeader('X-Request-Id', response.locals.requestId as string)
    response.setHeader('Cache-Control', 'no-store')
    response.on('finish', () => logger.event('request_completed', { requestId: response.locals.requestId as string, method: request.method, status: response.statusCode, durationMs: Math.round(performance.now() - started) }))
    if (request.headers.origin && !origins.includes(request.headers.origin)) { response.status(403).json({ error: 'This request is not permitted.' }); return }
    next()
  })
  app.enableCors({ origin: origins, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: false, maxAge: 600 })
  app.use(json({ limit: '8kb', strict: true, type: 'application/json' }))
  const parsingErrors: ErrorRequestHandler = (error: unknown, _request, response, next) => {
    if (error && typeof error === 'object' && 'type' in error && ['entity.too.large', 'entity.parse.failed'].includes(String(error.type))) {
      const tooLarge = error.type === 'entity.too.large'
      response.status(tooLarge ? 413 : 400).json({ error: tooLarge ? 'The request is too large.' : 'Invalid JSON.' }); return
    }
    next(error)
  }
  app.use(parsingErrors)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, transformOptions: { enableImplicitConversion: false }, validationError: { target: false, value: false }, exceptionFactory: () => new BadRequestException() }))
  app.useGlobalFilters(new SafeHttpExceptionFilter(logger, config.get('RATE_LIMIT_WINDOW_SECONDS', { infer: true })))
  app.enableShutdownHooks()
  await app.init()
  return { app, config, logger }
}
