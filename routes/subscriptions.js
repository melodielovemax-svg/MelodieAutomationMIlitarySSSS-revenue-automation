const express = require('express')
const router = express.Router()
const stripe = require('stripe')('sk_test_YourTestKeyHere')

// GET - Get user's subscriptions
router.get('/', async (req, res) => {
  try {
    res.json({ subscriptions: [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST - Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { priceId, userId } = req.body
    const session = await stripe.checkout.session.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: '/success',
      cancel_url: '/cancel'
    })
    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
