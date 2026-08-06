import { useState } from 'react'
import type { CodexDeviceAuth } from './useCodexConnect'

interface Props {
  device: CodexDeviceAuth
  onCancel: () => void
}

/** ChatGPT側で入力するワンタイムコードの表示 */
export const CodexDeviceCode: React.FC<Props> = ({ device, onCancel }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(device.userCode)
    setCopied(true)
  }

  return (
    <div className="flex flex-col items-center">
      <a
        href={device.verificationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-2 text-xs text-gray-500 underline"
      >
        開いたページでこのコードを入力（15分で失効）
      </a>
      <div className="mb-3 flex items-center gap-2">
        <code className="rounded bg-slate-50 px-4 py-2 font-mono text-xl font-bold tracking-widest">
          {device.userCode}
        </code>
        <button
          className="rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          onClick={onCopy}
        >
          {copied ? 'コピーしました' : 'コピー'}
        </button>
      </div>
      <button
        className="rounded-md border border-slate-300 px-3 py-1 text-xs text-gray-700 transition hover:bg-slate-50"
        onClick={onCancel}
      >
        キャンセル
      </button>
    </div>
  )
}
