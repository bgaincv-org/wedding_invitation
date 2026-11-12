const weddingDatabase = db.getSiblingDB('wedding')
weddingDatabase.createUser({ user: 'wedding', pwd: process.env.MONGO_APP_PASSWORD, roles: [{ role: 'readWrite', db: 'wedding' }] })
