import type { LoggerService } from '@nestjs/common'

/** Deliberately log structured metadata only, never bodies, URLs, headers, or error stacks. */
export class SafeLogger implements LoggerService {
  constructor(private readonly silent = false) {}
  event(event: string, metadata: Record<string, string | number | boolean> = {}) {
    if (!this.silent) process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), event, ...metadata })}\n`)
  }
  log(_message: unknown) { /* Nest startup messages are replaced by the explicit ready event. */ }
  error(_message: unknown) { this.event('framework_error') }
  warn(_message: unknown) { this.event('framework_warning') }
  debug(_message: unknown) {}
  verbose(_message: unknown) {}
  fatal(_message: unknown) { this.event('framework_fatal') }
}
