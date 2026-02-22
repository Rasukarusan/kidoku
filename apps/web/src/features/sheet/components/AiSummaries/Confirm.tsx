import { Accordion } from '@/components/layout/Accordion'
import { Modal } from '@/components/layout/Modal'
import { CourseId } from '@/types/user'
import { Book } from '@/types/book'
import { uniq } from '@/utils/array'
import dayjs from 'dayjs'
import { useState, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { aiSummaryPrompt } from '@/libs/ai/prompt'
import { FaRegCopy, FaCheck, FaDownload } from 'react-icons/fa'
import { MdFilterList } from 'react-icons/md'
import { useMutation, useQuery } from '@apollo/client'
import { aiSummaryUsageQuery, saveAiSummaryMutation } from '../../api'

export type FilterSettings = {
  months: string[]
  categories: string[]
}

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: (settings: FilterSettings) => void
  onManualSet: (json: Record<string, string>) => void
  courseId: CourseId
  sheetName: string
  books: Book[]
}

export const Confirm: React.FC<Props> = ({
  open,
  onCancel,
  onConfirm,
  onManualSet,
  sheetName,
  books,
}) => {
  const MONTHLY_LIMIT = 3
  const initialMonths = uniq(
    books.filter((b) => b.finished).map((b) => dayjs(b.finished).month() + 1)
  )
  const initialCategories = uniq(books.map((book) => book.category))
  const [months, setMonths] = useState(initialMonths)
  const [categories, setCategories] = useState(initialCategories)
  const [copied, setCopied] = useState(false)
  const [manualJson, setManualJson] = useState('')
  const [jsonError, setJsonError] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveAiSummary] = useMutation(saveAiSummaryMutation)

  const handleManualSet = async () => {
    try {
      const parsed = JSON.parse(manualJson)
      setJsonError('')
      setSaving(true)

      // DBに保存
      await saveAiSummary({
        variables: { input: { sheetName, analysis: parsed } },
      })

      onManualSet(parsed)
      onCancel()
    } catch {
      setJsonError('JSONの形式が正しくありません')
    } finally {
      setSaving(false)
    }
  }

  const prompt = useMemo(() => {
    const targetBooks = books
      .filter((book) => book.finished)
      .filter((book) => book.isPublicMemo) // isPublicMemo = trueの本のみ対象
      .filter((book) => {
        const month = dayjs(book.finished).month() + 1
        return months.includes(month) && categories.includes(book.category)
      })
      .map((book) => ({
        title: book.title,
        category: book.category,
        memo: book.memo.replace(/\*.*\*/g, '***'),
        finished: book.finished,
      }))
    return `${aiSummaryPrompt}\n${JSON.stringify(targetBooks, null, 2)}`
  }, [books, months, categories])

  const handleCopyPrompt = async () => {
    try {
      console.log('プロンプトの長さ:', prompt.length, '文字')
      console.log('プロンプトの最初の100文字:', prompt.substring(0, 100))
      console.log(
        'プロンプトの最後の100文字:',
        prompt.substring(prompt.length - 100)
      )
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error)
      alert('コピーに失敗しました。コンソールを確認してください。')
    }
  }

  const handleDownloadPrompt = () => {
    try {
      const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-summary-prompt-${sheetName}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('ダウンロードに失敗しました:', error)
      alert('ダウンロードに失敗しました。')
    }
  }

  const { data } = useQuery(aiSummaryUsageQuery)

  const isLimited = data?.aiSummaryUsage >= MONTHLY_LIMIT
  return (
    <Modal
      open={open}
      onClose={onCancel}
      className="max-w-md flex-col items-center"
    >
      <div className="w-full rounded-md p-6 sm:w-[450px] sm:p-10">
        <div className="mb-2 text-center text-sm font-bold leading-5">
          今月の残り：
          <span className="fon-bold mx-1">
            {MONTHLY_LIMIT - data?.aiSummaryUsage}/{MONTHLY_LIMIT}
          </span>
          回
        </div>
        <div
          className={twMerge(
            'mb-2 text-center text-sm font-bold',
            isLimited && 'text-red-500'
          )}
        >
          {isLimited ? '今月の上限に達しました' : 'AI分析を実行しますか？'}
        </div>
        <div className="mb-2 flex items-center justify-evenly">
          <button
            className="w-[90px] rounded-md border bg-gray-400 py-2 text-xs text-white hover:brightness-110 sm:w-[130px] sm:text-sm"
            onClick={onCancel}
          >
            キャンセル
          </button>
          {!isLimited && (
            <button
              className="w-[90px] rounded-md border border-ai py-2 text-xs text-ai hover:brightness-125 sm:w-[130px] sm:text-sm"
              onClick={() => onConfirm({ months: months, categories })}
            >
              OK
            </button>
          )}
        </div>
        <div className="my-4 border-t pt-4">
          <div className="mb-2 font-bold">手動で結果をセット</div>

          {/* プロンプトプレビュー */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                プロンプトプレビュー ({prompt.length.toLocaleString()} 文字)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleCopyPrompt}
                  className="rounded bg-white/80 p-1.5 shadow-sm hover:bg-white"
                  title={copied ? 'コピーしました' : 'コピー'}
                >
                  {copied ? (
                    <FaCheck className="text-green-500" size={12} />
                  ) : (
                    <FaRegCopy className="text-gray-600" size={12} />
                  )}
                </button>
                <button
                  onClick={handleDownloadPrompt}
                  className="rounded bg-white/80 p-1.5 shadow-sm hover:bg-white"
                  title="ダウンロード"
                >
                  <FaDownload className="text-gray-600" size={12} />
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={prompt}
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 font-mono text-xs"
              rows={8}
            />
          </div>

          {/* LLM出力ペースト用テキストエリア */}
          <div className="mb-1 text-xs text-gray-500">LLMの出力をペースト</div>
          <textarea
            className="w-full rounded border border-gray-300 p-2 text-xs"
            rows={5}
            placeholder="LLMの出力JSONをペースト..."
            value={manualJson}
            onChange={(e) => setManualJson(e.target.value)}
          />
          {jsonError && (
            <div className="mb-2 text-xs text-red-500">{jsonError}</div>
          )}
          <button
            onClick={handleManualSet}
            disabled={!manualJson || saving}
            className="mt-2 w-full rounded border border-ai py-2 text-xs text-ai hover:brightness-125 disabled:opacity-50"
          >
            {saving ? '保存中...' : '結果をセット'}
          </button>
        </div>
        <Accordion
          title={
            <span className="flex items-center gap-1">
              <MdFilterList size={16} />
              絞り込み
            </span>
          }
          className="text-sm"
        >
          <div className="p-2 text-left">
            <div className="mb-3">
              <div className="mb-1.5 text-xs font-bold text-gray-500">
                読了月
              </div>
              <div className="flex flex-wrap gap-1.5">
                {initialMonths.map((month) => (
                  <button
                    key={month}
                    type="button"
                    className={twMerge(
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      months.includes(month)
                        ? 'border-ai bg-ai/10 font-bold text-ai'
                        : 'border-gray-300 bg-gray-100 text-gray-400'
                    )}
                    onClick={() => {
                      if (months.includes(month)) {
                        setMonths(months.filter((v) => v !== month))
                      } else {
                        setMonths([...months, month])
                      }
                    }}
                  >
                    {month}月
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">
                カテゴリ
              </div>
              <div className="flex flex-wrap gap-1.5">
                {initialCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={twMerge(
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      categories.includes(category)
                        ? 'border-ai bg-ai/10 font-bold text-ai'
                        : 'border-gray-300 bg-gray-100 text-gray-400'
                    )}
                    onClick={() => {
                      if (categories.includes(category)) {
                        setCategories(categories.filter((v) => v !== category))
                      } else {
                        setCategories([...categories, category])
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Accordion>
      </div>
    </Modal>
  )
}
