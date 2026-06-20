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
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc'
import { Transaction } from '@mysten/sui/transactions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mysten/dapp-kit/dist/index.css'
import {
  suiNetwork,
  suiPaymentAmountMist,
  suiPaymentAmountLabel,
} from '@/libs/sui/config'
import { createPurchaseMutation } from '@/features/purchase/api'
import { SuiLogo } from '@/components/icon/SuiLogo'

// dapp-kit が要求する react-query クライアント（このモーダル内でのみ使用）
const queryClient = new QueryClient()

const networks = {
  mainnet: { url: getJsonRpcFullnodeUrl('mainnet'), network: 'mainnet' },
  testnet: { url: getJsonRpcFullnodeUrl('testnet'), network: 'testnet' },
  devnet: { url: getJsonRpcFullnodeUrl('devnet'), network: 'devnet' },
  localnet: { url: getJsonRpcFullnodeUrl('localnet'), network: 'localnet' },
}

interface Props {
  open: boolean
  onClose: () => void
  bookId: number
  /** 送金先（本の所有者の受取アドレス） */
  recipientAddress: string
  onPurchased?: () => void
}

export const SuiCheckoutModal: React.FC<Props> = ({
  open,
  onClose,
  bookId,
  recipientAddress,
  onPurchased,
}) => {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} className="min-w-1/2 bg-white p-6">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork={suiNetwork}>
          <WalletProvider autoConnect slushWallet={{ name: 'Kidoku' }}>
            <SuiCheckoutForm
              bookId={bookId}
              recipientAddress={recipientAddress}
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
  recipientAddress: string
  onPurchased?: () => void
  onClose: () => void
}

const SuiCheckoutForm: React.FC<FormProps> = ({
  bookId,
  recipientAddress,
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
      tx.transferObjects([coin], recipientAddress)

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
    <div className="flex flex-col items-center gap-5">
      {/* ヘッダー: グラデーション + 水滴ロゴ */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4da2ff] to-[#0571e6] shadow-lg shadow-sky-500/40 ring-1 ring-white/30">
          <SuiLogo size={28} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Sui で書籍を購入</h2>
      </div>

      {/* 金額カード */}
      <div className="w-full rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-center">
        <p className="text-xs text-gray-500">お支払い金額</p>
        <p className="bg-gradient-to-r from-[#4da2ff] to-[#0571e6] bg-clip-text text-2xl font-extrabold tabular-nums text-transparent">
          {suiPaymentAmountLabel}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-sky-600 ring-1 ring-sky-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {suiNetwork}
        </span>
      </div>

      <div className="sui-connect-wrap w-full [&_button]:!w-full [&_button]:!justify-center [&_button]:!rounded-full">
        <ConnectButton />
      </div>

      {account && status !== 'success' && (
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#4da2ff] via-[#3b82f6] to-[#0571e6] px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 ring-1 ring-inset ring-white/25 transition-all duration-200 hover:shadow-sky-400/50 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {status === 'paying'
                ? 'ウォレットで署名中...'
                : '購入を記録中...'}
            </>
          ) : (
            <>
              <SuiLogo size={16} className="text-white" />
              {suiPaymentAmountLabel} を支払う
            </>
          )}
        </button>
      )}

      {status === 'success' && (
        <button
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
        >
          閉じる
        </button>
      )}

      {message && (
        <p
          className={`text-center text-sm ${status === 'error' ? 'text-red-500' : 'text-emerald-600'}`}
        >
          {message}
        </p>
      )}

      <p className="flex items-center gap-1 text-[11px] text-gray-400">
        <SuiLogo size={11} className="text-sky-400" />
        Powered by Sui blockchain
      </p>
    </div>
  )
}
