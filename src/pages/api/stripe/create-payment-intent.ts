import Stripe from 'stripe'

export default async function handler(req, res) {
  const { items } = req.body
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 50,
    currency: 'jpy',
    automatic_payment_methods: {
      enabled: true,
    },
  })
  res.send({
    clientSecret: paymentIntent.client_secret,
  })
}
