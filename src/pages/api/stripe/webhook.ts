import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET

export default async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    console.log(event)
    res.send()
  } catch (e) {
    console.error(e)
    res.send()
  }
}
