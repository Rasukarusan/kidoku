export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet'

export const SUI_DECIMALS = 9

/** 決済対象のSuiネットワーク */
export const suiNetwork: SuiNetwork =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork) || 'testnet'

/** 送金先（受取）アドレス */
export const suiRecipientAddress =
  process.env.NEXT_PUBLIC_SUI_RECIPIENT_ADDRESS || ''

/** 決済金額（MIST単位。1 SUI = 1_000_000_000 MIST。既定: 0.01 SUI） */
export const suiPaymentAmountMist = BigInt(
  process.env.NEXT_PUBLIC_SUI_PAYMENT_AMOUNT_MIST || '10000000'
)

/**
 * Sui決済が利用可能かどうか。
 * フラグが有効かつ送金先アドレスが設定されている場合のみ有効。
 */
export const isSuiPaymentEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SUI_PAYMENT === 'true' &&
  suiRecipientAddress.length > 0

/** MIST を SUI 表記の文字列に変換する */
export const mistToSui = (mist: bigint): string => {
  const base = BigInt(10) ** BigInt(SUI_DECIMALS)
  const whole = mist / base
  const frac = mist % base
  if (frac === BigInt(0)) return whole.toString()
  const fracStr = frac.toString().padStart(SUI_DECIMALS, '0').replace(/0+$/, '')
  return `${whole.toString()}.${fracStr}`
}

/** 表示用の決済金額ラベル（例: "0.01 SUI"） */
export const suiPaymentAmountLabel = `${mistToSui(suiPaymentAmountMist)} SUI`
