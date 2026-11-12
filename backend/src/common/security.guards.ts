import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException, UnsupportedMediaTypeException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, timingSafeEqual } from 'node:crypto'
import type { Request } from 'express'
import type { Environment } from '../config/environment.js'

@Injectable()
export class WriteOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Environment, true>) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const allowed = this.config.get('ALLOWED_ORIGINS', { infer: true })
    if (!request.headers.origin || !allowed.includes(request.headers.origin)) {
      throw new ForbiddenException()
    }
    if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new UnsupportedMediaTypeException()
    return true
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Environment, true>) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const secret = this.config.get('ADMIN_TOKEN', { infer: true })
    const supplied = request.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1]
    if (!secret || !supplied) throw new UnauthorizedException()
    const expected = createHash('sha256').update(secret).digest()
    const actual = createHash('sha256').update(supplied).digest()
    if (!timingSafeEqual(expected, actual)) throw new UnauthorizedException()
    const origin = request.headers.origin
    if (origin && !this.config.get('ALLOWED_ORIGINS', { infer: true }).includes(origin)) throw new ForbiddenException()
    return true
  }
}
