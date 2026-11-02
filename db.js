// MELODIESPARK MVP - Database Connection
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: require('./config').DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Connect on first query
pool.on('connect', (client) => {
  client.on('query', (query) => {
    // quiet logging
  })
  client.on('error', (err) => {
    console.error('Unexpected client error', err)
    process.exit(-1)
  })
})

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
}