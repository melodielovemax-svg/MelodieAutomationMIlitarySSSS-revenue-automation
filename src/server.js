// MELODIESPARK MVP - Secure Server Setup
require('dotenv').config({ path: './.env' })

const fastify = require('fastify')({
  logger: true
})
const fastifyCors = require('@fastify/cors')
const fastifyHelmet = require('@fastify/helmet')
const fastifyRateLimit = require('@fastify/rate-limit')

// Security plugins
fastify.register(fastifyCors, { origin: true })
fastify.register(fastifyHelmet)
fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// Validate critical configuration
if (!process.env.STRIPE_SECRET_KEY) {
  fastify.log.warn('⚠️ STRIPE_SECRET_KEY not configured - using test mode fallback')
}

if (!process.env.DATABASE_URL) {
  fastify.log.error('❌ DATABASE_URL not configured - shutting down')
  process.exit(1)
}

// Register routes
fastify.register(require('./routes/products'))
fastify.register(require('./routes/subscriptions'))
fastify.register(require('./routes/auth'))
fastify.register(require('./routes/ai'))
fastify.register(require('./routes/karma'))
fastify.register(require('./tokens'))

/// ==========================================
// Health Check - Includes config validation
// ==========================================
fastify.get('/health', async (request, reply) => {
  try {
    const dbResult = await pool.query('SELECT 1')
    const stripeConfig = !!process.env.STRIPE_SECRET_KEY
    
    const healthStatus = {
      status: 'ok',
      database: 'connected',
      stripeConfigured: stripeConfig,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }
    
    // Return warning if Stripe not configured but don't fail health check
    if (!stripeConfig) {
      healthStatus.stripeWarning = 'Stripe keys not configured - using test mode'
    }
    
    return healthStatus
  } catch (err) {
    reply.code(500).send({ error: 'Database connection failed' })
  }
})

// ==========================================
// Root route
// ==========================================
fastify.get('/', async (request, reply) => {
  return { 
    message: 'MELODIESPARK MVP API', 
    version: '1.0.0',
    status: 'secure',
    environment: process.env.NODE_ENV
  }
})

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 3000

fastify.listen({
  port: PORT,
  host: '0.0.0.0'
}, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`🚀 MELODIESPARK MVP running at ${address}`)
  fastify.log.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`)
  fastify.log.info(`🔑 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  fastify.log.info('SIGTERM received. Shutting down gracefully...')
  try {
    await pool.end()
    fastify.close()
    process.exit(0)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

module.exports = fastify