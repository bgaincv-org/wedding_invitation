import { createApplication } from './bootstrap.js'

async function main() {
  const { app, config, logger } = await createApplication()
  const port = config.get('PORT', { infer: true })
  await app.listen(port, config.get('HOST', { infer: true }))
  logger.event('api_ready', { port })
}
void main().catch(() => {
  process.stderr.write(`${JSON.stringify({ event: 'startup_failed', message: 'Check backend configuration and MongoDB availability. Secret values are not logged.' })}\n`)
  process.exitCode = 1
})
