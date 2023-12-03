import { useEffect, useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { StripePaymentElementOptions } from '@stripe/stripe-js'

interface Props {
  returnUrl: string
  purchaseText: string
}
export const CheckoutForm: React.FC<Props> = ({ returnUrl, purchaseText }) => {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    })
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mx-auto mt-4 block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            <span>{purchaseText}</span>
          )}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
