import stripe from '@/libs/stripe'
import { buffer } from 'micro'

export const config = {
  api: {
    bodyParser: false,
  },
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async (req, res) => {
  try {
    const buf = await buffer(req)
    const signature = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(
      buf.toString(),
      signature,
      webhookSecret
    )
    console.log(event)
    res.send()
  } catch (e) {
    console.error(e)
    res.send()
  }
}
