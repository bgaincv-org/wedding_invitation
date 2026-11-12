import { z } from 'zod'

const originSchema = z.string().refine(value => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value && !url.username && !url.password
  } catch { return false }
}, 'Use exact HTTP(S) origins without paths or trailing slashes')

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  HOST: z.string().default('127.0.0.1'),
  MONGODB_URI: z.string().min(1).refine(value => /^mongodb(?:\+srv)?:\/\//.test(value), 'A MongoDB URI is required'),
  ALLOWED_ORIGINS: z.string().default('http://127.0.0.1:5173,http://localhost:5173').transform(value => value.split(',').map(item => item.trim()).filter(Boolean)).pipe(z.array(originSchema).min(1)),
  ADMIN_TOKEN: z.preprocess(value => value === '' ? undefined : value, z.string().min(32).optional()),
  RATE_LIMIT_SECRET: z.string().min(32),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(10),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(10).max(3600).default(600),
  RSVP_ENABLED: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),
  WEDDING_EVENT_IDS: z.string().default('reception,wedding').transform(value => value.split(',').map(item => item.trim()).filter(Boolean)).pipe(z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).min(1)),
  // Explicit IP/CIDR ranges only. Never blindly trust forwarded headers.
  TRUST_PROXY: z.string().default('').refine(value => !['true', '1', '*'].includes(value.trim()), 'Configure explicit proxy IP/CIDR ranges'),
  LOG_LEVEL: z.enum(['silent', 'info']).default('info'),
})
export type Environment = z.infer<typeof environmentSchema>

export function validateEnvironment(raw: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(raw)
  if (!result.success) {
    // Report key names only: configuration errors must not reveal credentials.
    throw new Error(`Invalid backend configuration: ${[...new Set(result.error.issues.map(issue => issue.path[0]))].join(', ')}`)
  }
  if (result.data.NODE_ENV === 'production' && result.data.ALLOWED_ORIGINS.some(origin => !origin.startsWith('https://'))) {
    throw new Error('Production ALLOWED_ORIGINS must use HTTPS')
  }
  return result.data
}
