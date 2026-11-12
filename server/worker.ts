import { handleApi } from './api'
import { siteHeaders } from './siteHeaders'
import type { Store } from './api'
interface Statement { bind(...params: unknown[]): Statement; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; run(): Promise<unknown> }
interface Env { DB: { prepare(sql: string): Statement }; ASSETS: { fetch(request: Request): Promise<Response> }; ADMIN_TOKEN?: string }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      const db: Store = {
        first: <T>(sql: string, params: unknown[] = []) => env.DB.prepare(sql).bind(...params).first<T>(),
        all: async <T>(sql: string, params: unknown[] = []) => (await env.DB.prepare(sql).bind(...params).all<T>()).results,
        run: async (sql, params = []) => { await env.DB.prepare(sql).bind(...params).run() },
      }
      return handleApi(request, db, { ip: request.headers.get('cf-connecting-ip') ?? undefined, adminToken: env.ADMIN_TOKEN })
    }
    const response = await env.ASSETS.fetch(request)
    const headers = new Headers(response.headers)
    for (const [key, value] of Object.entries(siteHeaders)) headers.set(key, value)
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    return new Response(response.body, { status: response.status, headers })
  },
}
