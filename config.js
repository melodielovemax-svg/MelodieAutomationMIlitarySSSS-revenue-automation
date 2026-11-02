// MELODIESPARK MVP - Configuration
require('dotenv').config()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key'
const JWT_SECRET = process.env.JWT_SECRET || 'melodiespark-jwt-secret'
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/melodiespark'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const PORT = process.env.PORT || 3000

module.exports = {
  STRIPE_SECRET_KEY,
  JWT_SECRET,
  DATABASE_URL,
  FRONTEND_URL,
  PORT
}