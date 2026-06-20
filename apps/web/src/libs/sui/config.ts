export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet'

export const SUI_DECIMALS = 9

/** 決済対象のSuiネットワーク */
export const suiNetwork: SuiNetwork =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork) || 'testnet'

/** 決済金額（MIST単位。1 SUI = 1_000_000_000 MIST。既定: 0.01 SUI） */
export const suiPaymentAmountMist = BigInt(
  process.env.NEXT_PUBLIC_SUI_PAYMENT_AMOUNT_MIST || '10000000'
)

/**
 * Sui決済機能が有効かどうか（機能フラグ）。
 * 実際の送金先は本の所有者ごとの受取アドレスを別途取得する。
 */
export const isSuiPaymentEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SUI_PAYMENT === 'true'

/** MIST を SUI 表記の文字列に変換する */
export const mistToSui = (mist: bigint): string => {
  const base = BigInt(10) ** BigInt(SUI_DECIMALS)
  const whole = mist / base
  const frac = mist % base
  if (frac === BigInt(0)) return whole.toString()
  const fracStr = frac.toString().padStart(SUI_DECIMALS, '0').replace(/0+$/, '')
  return `${whole.toString()}.${fracStr}`
}

/**
 * SUI 表記の文字列（例: "0.05"）を MIST(bigint) に変換する。
 * 不正な値の場合は null を返す。
 */
export const suiToMist = (sui: string): bigint | null => {
  const trimmed = sui.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === '' || trimmed === '.') {
    return null
  }
  const [whole = '0', frac = ''] = trimmed.split('.')
  if (frac.length > SUI_DECIMALS) {
    // 小数点以下が MIST の精度を超える場合は無効
    return null
  }
  const paddedFrac = frac.padEnd(SUI_DECIMALS, '0')
  const base = BigInt(10) ** BigInt(SUI_DECIMALS)
  return BigInt(whole) * base + BigInt(paddedFrac || '0')
}

/** MIST文字列を "0.01 SUI" 形式のラベルにする */
export const mistToSuiLabel = (mist: string): string =>
  `${mistToSui(BigInt(mist))} SUI`

/**
 * 本ごとの価格(MIST文字列)を解決する。未設定ならグローバル既定額にフォールバック。
 */
export const resolveBookPriceMist = (price?: string | null): bigint => {
  if (price && /^\d+$/.test(price)) {
    return BigInt(price)
  }
  return suiPaymentAmountMist
}

/** 表示用の決済金額ラベル（例: "0.01 SUI"） */
export const suiPaymentAmountLabel = `${mistToSui(suiPaymentAmountMist)} SUI`
