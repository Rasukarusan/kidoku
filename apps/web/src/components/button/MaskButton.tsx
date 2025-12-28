import { RefObject } from 'react'

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement>
  onTextChange: (newText: string) => void
  className?: string
}

export const MaskButton: React.FC<Props> = ({
  textareaRef,
  onTextChange,
  className = '',
}) => {
  const handleClick = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    // テキストが選択されていない場合はアラートを表示
    if (!selectedText) {
      alert('マスクしたいテキストを選択してください')
      return
    }

    // フォーカスを確保
    textarea.focus()

    // 選択範囲を再設定
    textarea.setSelectionRange(start, end)

    // document.execCommandを使ってundo履歴に記録
    // 選択されたテキストを[[MASK: text]]で囲んだものに置き換え
    const maskedText = `[[MASK: ${selectedText}]]`
    document.execCommand('insertText', false, maskedText)

    // カーソル位置を調整（マスク記法の終了位置に移動）
    const newCursorPos = start + maskedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${className}`}
      title="選択したテキストをマスキング"
    >
      <span className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
        マスク
      </span>
    </button>
  )
}
