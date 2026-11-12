import { openDatabase } from '../server/database'
const { db, sqlite } = openDatabase()
const [command, reference] = process.argv.slice(2)
if (command === 'export') console.log(JSON.stringify(await db.all('SELECT receipt, name, email, attendance, guests, note, created_at FROM rsvps ORDER BY created_at DESC'), null, 2))
else if (command === 'delete' && /^[A-F0-9]{16}$/.test(reference ?? '')) { await db.run('DELETE FROM rsvps WHERE receipt = ?', [reference]); console.log('Reply removed.') }
else { console.error('Usage: yarn rsvps export | yarn rsvps delete REFERENCE'); process.exitCode = 1 }
sqlite.close()
