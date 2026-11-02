// MELODIESPARK MVP - Main Server
const fastify = require('fastify')({
  logger: true
})
const fastifyCors = require('@fastify/cors')
const fastifyHelmet = require('@fastify/helmet')
const fastifyRateLimit = require('@fastify/rate-limit')

// Register plugins
fastify.register(fastifyCors, { origin: true })
fastify.register(fastifyHelmet)
fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// Register routes
fastify.register(require('./routes/products'))
fastify.register(require('./routes/subscriptions'))
fastify.register(require('./routes/auth'))
fastify.register(require('./routes/ai'))
fastify.register(require('./routes/karma'))
fastify.register(require('./tokens'))

// Health check
fastify.get('/health', async (request, reply) => {
  try {
    await pool.query('SELECT 1')
    return { status: 'ok', database: 'connected' }
  } catch (err) {
    reply.code(500).send({ error: 'Database connection failed' })
  }
})

// Root route
fastify.get('/', async (request, reply) => {
  return { message: 'MELODIESPARK MVP API', version: '1.0.0' }
})

// Start server
const PORT = require('./config').PORT

fastify.listen({
  port: PORT,
  host: '0.0.0.0'
}, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`MELODIESPARK MVP running at ${address}`)
})

module.exports = fastify