const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = { id: 'user_123', email }
    const token = jwt.sign({ userId: user.id }, 'melodiespark-jwt-secret-key-change-me', { expiresIn: '7d' })
    res.json({ token, user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/verify', async (req, res) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: 'No token provided' })
    const token = header.split(' ')[1]
    jwt.verify(token, 'melodiespark-jwt-secret-key-change-me', (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' })
      res.json({ user })
    })
  })
)

module.exports = router
