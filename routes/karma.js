const express = require('express')
const router = express.Router()

// GET - Get user's karma balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const karmaBalance = 450
    res.json({ userId: req.params.userId, karmaBalance })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST - Earn karma
router.post('/earn', async (req, res) => {
  try {
    const { userId, points, reason } = req.body
    res.json({ userId, pointsEarned: points, newBalance: 450 + points })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST - Redeem karma
router.post('/redeem', async (req, res) => {
  try {
    const { userId, points, reward } = req.body
    res.json({ userId, pointsRedeemed: points, newBalance: 450 - points })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
