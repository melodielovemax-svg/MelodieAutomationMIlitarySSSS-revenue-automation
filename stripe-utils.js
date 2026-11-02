// MELODIESPARK MVP - Stripe Utilities
const Stripe = require('stripe')
const stripe = new Stripe(require('./config').STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  accelerations: {
    enablePaymentsV3: true
  }
})

// Create product in Stripe and database
async function createStripeProduct(productData) {
  const stripeProduct = await stripe.products.create({
    name: productData.name,
    description: productData.description || '',
    metadata: productData.metadata || {}
  })

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(parseFloat(productData.price) * 100),
    currency: productData.currency || 'usd',
    recurring: productData.recurring === true ? { interval: 'month' } : undefined
  })

  return { stripeProduct, stripePrice }
}

// Retrieve product from Stripe
async function getStripeProduct(productId) {
  return await stripe.products.retrieve(productId)
}

// Create checkout session
async function createCheckoutSession(sessionData) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: sessionData.lineItems,
    mode: sessionData.mode || 'payment',
    success_url: sessionData.successUrl,
    cancel_url: sessionData.cancelUrl,
    customer_email: sessionData.customerEmail,
    metadata: sessionData.metadata || {}
  })

  return session
}

// Handle webhook events
function constructEvent(request, signingSecret) {
  const payload = request.rawBody
  const sig = request.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, signingSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    throw new Error(`Webhook Error: ${err.message}`)
  }

  return event
}

module.exports = {
  stripe,
  createStripeProduct,
  getStripeProduct,
  createCheckoutSession,
  constructEvent
}