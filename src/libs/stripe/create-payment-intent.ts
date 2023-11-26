import stripe from '@/libs/stripe'
export const createPaymentIntent = async () => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 50,
    currency: 'jpy',
    automatic_payment_methods: {
      enabled: true,
    },
  })
  return paymentIntent
}
