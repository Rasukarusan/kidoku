import { useEffect, useState } from 'react'
import { Modal } from '../layout/Modal'
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from '@/components/form/CheckoutForm'
import {
  loadStripe,
  StripeElementsOptions,
  Appearance,
} from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface Props {
  open: boolean
  onClose: () => void
  returnUrl: string
  purchaseText: string
}

export const CheckoutModal: React.FC<Props> = ({
  open,
  onClose,
  returnUrl,
  purchaseText,
}) => {
  const [clientSecret, setClientSecret] = useState('')
  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
  }, [])

  const appearance: Appearance = {
    theme: 'stripe',
  }
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  }

  if (!open) return null
  return (
    <Modal
      onClose={() => {
        onClose()
      }}
      open={open}
      className="min-h-1/2 min-w-1/2 bg-white p-4"
    >
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm returnUrl={returnUrl} purchaseText={purchaseText} />
        </Elements>
      )}
    </Modal>
  )
}
