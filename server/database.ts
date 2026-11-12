import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { SQLInputValue } from 'node:sqlite'
import type { Store } from './api'

export function openDatabase(filename = process.env.DATABASE_PATH ?? 'data/rsvp.sqlite') {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true })
  const sqlite = new DatabaseSync(filename)
  sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;')
  if (!sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rsvps'").get()) {
    sqlite.exec(readFileSync(new URL('../drizzle/0000_wedding_rsvp.sql', import.meta.url), 'utf8'))
  }
  if (!sqlite.prepare('PRAGMA table_info(rsvps)').all().some(column => column.name === 'event_ids')) {
    sqlite.exec(readFileSync(new URL('../drizzle/0001_rsvp_events.sql', import.meta.url), 'utf8'))
  }
  const db: Store = {
    async first<T>(sql: string, params: unknown[] = []) { return (sqlite.prepare(sql).get(...params as SQLInputValue[]) as T) ?? null },
    async all<T>(sql: string, params: unknown[] = []) { return sqlite.prepare(sql).all(...params as SQLInputValue[]) as T[] },
    async run(sql: string, params: unknown[] = []) { sqlite.prepare(sql).run(...params as SQLInputValue[]) },
  }
  return { db, sqlite }
}
