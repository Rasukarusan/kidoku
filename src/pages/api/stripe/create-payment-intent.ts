import { createPaymentIntent } from '@/libs/stripe/create-payment-intent'

export default async function handler(req, res) {
  const paymentIntent = await createPaymentIntent()
  res.send({
    clientSecret: paymentIntent.client_secret,
  })
}
