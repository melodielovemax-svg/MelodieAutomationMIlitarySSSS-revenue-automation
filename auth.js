// MELODIESPARK MVP - Authentication
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('./db')
const config = require('./config')

async function registerUser({ email, password, fullName }) {
  // Check if user already exists
  const existing = await query('SELECT user_id FROM users WHERE email = $1', [email])
  if (existing.rowCount > 0) {
    throw new Error('Email already registered')
  }

  // Hash password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role, status, created_at)
     VALUES ($1, $2, $3, 'customer', 'pending', NOW())
     RETURNING user_id, email, full_name, role, status, created_at`,
    [email, hashedPassword, fullName || null]
  )

  // Create JWT token
  const token = jwt.sign(
    { userId: result.rows[0].user_id },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { user: result.rows[0], token }
}

async function loginUser({ email, password }) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  if (result.rowCount === 0) {
    throw new Error('Invalid credentials')
  }

  const user = result.rows[0]

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) {
    throw new Error('Invalid credentials')
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user.user_id },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Remove password hash from response
  const { password_hash, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}

async function authenticateWithMinimax(minimaxToken) {
  // In production, verify MiniMax token with MiniMax API
  // For MVP, create/minimal user session
  const result = await query(
    "SELECT * FROM users WHERE email LIKE $1",
    [`minimax-${Date.now()}@melodiespark.io`]
  )

  if (result.rowCount === 0) {
    const createResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role, status, created_at)
       VALUES ($1, $2, $3, 'customer', 'active', NOW())
       RETURNING user_id, email, full_name, role, status, created_at`,
      [`minimax-${Date.now()}@melodiespark.io`, '', 'MiniMax User', 'customer', 'active', new Date()]
    )

    const token = jwt.sign(
      { userId: createResult.rows[0].user_id },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    )

    return { user: createResult.rows[0], token }
  }

  const token = jwt.sign(
    { userId: result.rows[0].user_id },
    config.JWT_SECRET,
    { expiresIn: '30d' }
  )

  const { password_hash, ...userWithoutPassword } = result.rows[0]

  return { user: userWithoutPassword, token }
}

module.exports = {
  registerUser,
  loginUser,
  authenticateWithMinimax
}