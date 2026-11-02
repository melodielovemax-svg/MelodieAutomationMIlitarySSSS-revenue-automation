const express = require('express')
const router = express.Router()
const stripe = require('stripe')('sk_test_YourTestKeyHere')

// GET - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await stripe.products.list({ limit: 10 })
    res.json(products.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST - Create product
router.post('/', async (req, res) => {
  try {
    const product = await stripe.products.create({
      name: req.body.name,
      description: req.body.description,
      metadata: req.body.metadata
    })
    const price = await stripe.prices.create({
      unit_amount: req.body.price * 100,
      currency: 'usd',
      product: product.id
    })
    res.json({ product, price })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
