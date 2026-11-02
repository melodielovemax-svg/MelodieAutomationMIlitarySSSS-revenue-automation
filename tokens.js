// MELODIESPARK MVP - Token Routes
const { query } = require('../db')
const config = require('../config')

// Get user's MA token balance
fastify.get('/api/tokens/ma-balance', {
  preHandler: async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' })
    }
  }
}, async (request, reply) => {
  try {
    const result = await query(
      `SELECT ma_balance, total_earned, total_spent, last_updated
       FROM user_tokens
       WHERE user_id = $1`,
      [request.user.user_id]
    )

    if (result.rowCount === 0) {
      const insertResult = await query(
        `INSERT INTO user_tokens (user_id, ma_balance, total_earned, total_spent, last_updated)
         VALUES ($1, 0, 0, 0, NOW())
         RETURNING *`,
        [request.user.user_id]
      )
      return insertResult.rows[0]
    }

    return result.rows[0]
  } catch (err) {
    fastify.log.error(err, 'Error fetching MA token balance')
    reply.code(500).send({ error: 'Failed to fetch MA token balance' })
  }
})

// Swap MA tokens to crypto
fastify.post('/api/tokens/swap', {
  preHandler: async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' })
    }
  }
}, async (request, reply) => {
  try {
    const { amount, targetCrypto } = request.body

    if (!amount || amount <= 0) {
      return reply.code(400).send({ error: 'Valid amount is required' })
    }

    if (!targetCrypto) {
      return reply.code(400).send({ error: 'Target cryptocurrency is required' })
    }

    // Check balance
    const balanceResult = await query(
      `SELECT ma_balance FROM user_tokens WHERE user_id = $1`,
      [request.user.user_id]
    )

    if (balanceResult.rows[0].ma_balance < amount) {
      return reply.code(400).send({ error: 'Insufficient MA token balance' })
    }

    // Deduct MA tokens
    await query(
      `UPDATE user_tokens SET ma_balance = ma_balance - $1, total_spent = total_spent + $1 WHERE user_id = $2`,
      [amount, request.user.user_id]
    )

    // Log the swap
    await query(
      `INSERT INTO token_swaps (user_id, amount, target_crypto, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())`,
      [request.user.user_id, amount, targetCrypto]
    )

    return { 
      message: `MA tokens swapped for ${targetCrypto}`,
      amount,
      targetCrypto,
      status: 'pending',
      note: 'Swap processed - actual crypto transfer will occur via gateway'
    }
  } catch (err) {
    fastify.log.error(err, 'Error swapping MA tokens')
    reply.code(500).send({ error: 'Failed to swap MA tokens' })
  }
})

module.exports = { getMABalance: fastify.get('/api/tokens/ma-balance', ...), swapTokens: fastify.post('/api/tokens/swap', ...)