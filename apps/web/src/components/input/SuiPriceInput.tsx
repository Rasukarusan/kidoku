import { useState } from 'react'
import { mistToSui, suiToMist, suiPaymentAmountLabel } from '@/libs/sui/config'

interface Props {
  /** 現在の価格（MIST単位の文字列）。null/未設定なら既定額を用いる */
  valueMist?: string | null
  /** 変更時に MIST文字列（未設定時は null）を返す */
  onChange: (mist: string | null) => void
  disabled?: boolean
}

/**
 * 本ごとの購入価格を SUI 単位で入力するフィールド。
 * 内部では MIST 文字列に変換して onChange に渡す。
 * 入力途中の文字列（"0." など）を保持するためローカル state で管理するので、
 * 編集対象の本が切り替わるときは呼び出し側で `key` を付けて再マウントすること。
 */
export const SuiPriceInput: React.FC<Props> = ({
  valueMist,
  onChange,
  disabled,
}) => {
  const [text, setText] = useState<string>(
    valueMist ? mistToSui(BigInt(valueMist)) : ''
  )
  const [error, setError] = useState<string>('')

  const handleChange = (raw: string) => {
    setText(raw)
    if (raw.trim() === '') {
      setError('')
      onChange(null) // 未設定 = 既定額
      return
    }
    const mist = suiToMist(raw)
    if (mist === null || mist <= BigInt(0)) {
      setError('正しい金額を入力してください')
      return
    }
    setError('')
    onChange(mist.toString())
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="例: 0.05"
          className="w-28 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
        />
        <span className="text-sm text-gray-600">SUI</span>
      </div>
      {error ? (
        <p className="mt-1 text-right text-xs text-red-500">{error}</p>
      ) : (
        <p className="mt-1 text-right text-xs text-gray-400">
          未入力なら既定額（{suiPaymentAmountLabel}）
        </p>
      )}
    </div>
  )
}
