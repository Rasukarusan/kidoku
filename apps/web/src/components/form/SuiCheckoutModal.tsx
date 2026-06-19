import { useState } from 'react'
import { Modal } from '../layout/Modal'
import { useMutation } from '@apollo/client'
import {
  SuiClientProvider,
  WalletProvider,
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mysten/dapp-kit/dist/index.css'
import {
  suiNetwork,
  suiRecipientAddress,
  suiPaymentAmountMist,
  suiPaymentAmountLabel,
} from '@/libs/sui/config'
import { createPurchaseMutation } from '@/features/purchase/api'

// dapp-kit が要求する react-query クライアント（このモーダル内でのみ使用）
const queryClient = new QueryClient()

const networks = {
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  localnet: { url: getFullnodeUrl('localnet') },
}

interface Props {
  open: boolean
  onClose: () => void
  bookId: number
  onPurchased?: () => void
}

export const SuiCheckoutModal: React.FC<Props> = ({
  open,
  onClose,
  bookId,
  onPurchased,
}) => {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} className="min-w-1/2 bg-white p-6">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork={suiNetwork}>
          <WalletProvider autoConnect>
            <SuiCheckoutForm
              bookId={bookId}
              onPurchased={onPurchased}
              onClose={onClose}
            />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Modal>
  )
}

type PaymentStatus = 'idle' | 'paying' | 'recording' | 'success' | 'error'

interface FormProps {
  bookId: number
  onPurchased?: () => void
  onClose: () => void
}

const SuiCheckoutForm: React.FC<FormProps> = ({
  bookId,
  onPurchased,
  onClose,
}) => {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  const [createPurchase] = useMutation(createPurchaseMutation)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [message, setMessage] = useState('')

  const handlePay = async () => {
    if (!account) return
    setMessage('')
    try {
      // SUI を送金先へ転送するトランザクションを構築
      setStatus('paying')
      const tx = new Transaction()
      const [coin] = tx.splitCoins(tx.gas, [suiPaymentAmountMist])
      tx.transferObjects([coin], suiRecipientAddress)

      const result = await signAndExecute({ transaction: tx })

      // バックエンドで購入を検証・記録する
      setStatus('recording')
      await createPurchase({
        variables: {
          input: {
            bookId,
            txDigest: result.digest,
            senderAddress: account.address,
            network: suiNetwork,
          },
        },
      })

      setStatus('success')
      setMessage('購入が完了しました！')
      onPurchased?.()
    } catch (e) {
      setStatus('error')
      const msg =
        e instanceof Error ? e.message : '決済中にエラーが発生しました'
      setMessage(msg)
    }
  }

  const isProcessing = status === 'paying' || status === 'recording'

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-bold">Sui で書籍を購入</h2>
      <p className="text-sm text-gray-600">
        メモの閲覧には {suiPaymentAmountLabel} の支払いが必要です
        <br />
        <span className="text-xs text-gray-400">
          ネットワーク: {suiNetwork}
        </span>
      </p>

      <ConnectButton />

      {account && status !== 'success' && (
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'paying'
            ? '署名を待っています...'
            : status === 'recording'
              ? '購入を記録中...'
              : `${suiPaymentAmountLabel} を支払う`}
        </button>
      )}

      {status === 'success' && (
        <button
          onClick={onClose}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
        >
          閉じる
        </button>
      )}

      {message && (
        <p
          className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
