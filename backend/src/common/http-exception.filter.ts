import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import type { Response } from 'express'
import type { SafeLogger } from './safe-logger.js'

@Catch()
export class SafeHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: SafeLogger, private readonly retryAfterSeconds = 600) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : 503
    const messages: Record<number, string> = {
      400: 'Please check the submitted details.',
      401: 'Unauthorized.',
      403: 'This request is not permitted.',
      404: 'Not found.',
      409: 'This request reference has already been used with different details.',
      413: 'The request is too large.',
      415: 'JSON is required.',
      429: 'Please wait a few minutes before trying again.',
      503: 'Unable to save your reply right now. Please try again.',
    }
    this.logger.event('request_rejected', { status, requestId: String(response.locals.requestId ?? '') })
    if (status === 429) response.setHeader('Retry-After', String(this.retryAfterSeconds))
    response.status(status).json({ error: messages[status] ?? 'Unable to process this request.', requestId: response.locals.requestId })
  }
}
