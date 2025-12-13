import useSWR from 'swr'
import { Accordion } from '@/components/layout/Accordion'
import { Modal } from '@/components/layout/Modal'
import { CourseId } from '@/types/user'
import { fetcher } from '@/libs/swr'
import { Book } from '@/types/book'
import { uniq } from '@/utils/array'
import dayjs from 'dayjs'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { AiSummaryUsageResponse } from '@/types/api'
import { aiSummaryPrompt } from '@/libs/ai/prompt'
import { FaRegCopy, FaCheck } from 'react-icons/fa'

export type DetailSettings = {
  months: string[]
  categories: string[]
}

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: (settings: DetailSettings) => void
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

  const handleManualSet = async () => {
    try {
      const parsed = JSON.parse(manualJson)
      setJsonError('')
      setSaving(true)

      // DBに保存
      const response = await fetch('/api/ai-summary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName, analysis: parsed }),
      })

      if (!response.ok) {
        setJsonError('保存に失敗しました')
        setSaving(false)
        return
      }

      onManualSet(parsed)
      onCancel()
    } catch {
      setJsonError('JSONの形式が正しくありません')
    } finally {
      setSaving(false)
    }
  }

  const buildPrompt = () => {
    const targetBooks = books
      .filter((book) => book.finished)
      .filter((book) => {
        const month = dayjs(book.finished).month() + 1
        return months.includes(month) && categories.includes(book.category)
      })
      .map((book) => ({
        category: book.category,
        memo: book.memo.replace(/\*.*\*/g, '***'),
        finished: book.finished,
      }))
    return `${aiSummaryPrompt}\n${JSON.stringify(targetBooks)}`
  }

  const handleCopyPrompt = async () => {
    const prompt = buildPrompt()
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { data } = useSWR<AiSummaryUsageResponse>(
    `/api/ai-summary/usage?sheetName=${sheetName}&months=${months.join(',')}&categories=${categories.join(',')}`,
    fetcher
  )

  const isLimited = data?.count >= MONTHLY_LIMIT
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="w-full rounded-md p-6 sm:w-[450px] sm:p-10">
        <div className="mb-2 text-center text-sm font-bold leading-5">
          今月の残り：
          <span className="fon-bold mx-1">
            {MONTHLY_LIMIT - data?.count}/{MONTHLY_LIMIT}
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
        <div className="mb-2 flex justify-center">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            {copied ? (
              <>
                <FaCheck className="text-green-500" />
                コピーしました
              </>
            ) : (
              <>
                <FaRegCopy />
                プロンプトをコピー
              </>
            )}
          </button>
        </div>
        <Accordion title="詳細設定" className="text-sm">
          <div className="p-2 text-left">
            <div className="mb-2 flex justify-start">
              <div className="w-20 text-nowrap font-bold">読了日</div>
              <div className="grid grid-cols-3 sm:grid-cols-3">
                {initialMonths.map((month) => (
                  <div key={month} className="pb-1 pr-2">
                    <input
                      type="checkbox"
                      name={month}
                      id={month}
                      value={month}
                      className="mr-2 cursor-pointer"
                      checked={months.includes(month)}
                      onChange={(e) => {
                        const month = Number(e.target.value)
                        if (months.includes(month)) {
                          setMonths(months.filter((v) => v != month))
                        } else {
                          setMonths([...months, month])
                        }
                      }}
                    />
                    <label
                      htmlFor={month}
                      className="cursor-pointer select-none"
                    >
                      {month}月
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-2 flex">
              <div className="w-20 text-nowrap font-bold">カテゴリ</div>
              <div className="grid grid-cols-2">
                {initialCategories.map((category) => (
                  <div key={category} className="pb-1 pr-2">
                    <input
                      type="checkbox"
                      name={category}
                      id={category}
                      value={category}
                      className="mr-2 cursor-pointer"
                      checked={categories.includes(category)}
                      onChange={(e) => {
                        setCategories(
                          categories.filter((v) => v != e.target.value)
                        )
                      }}
                    />
                    <label
                      htmlFor={category}
                      className="cursor-pointer select-none"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 font-bold">手動で結果をセット</div>
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
          </div>
        </Accordion>
      </div>
    </Modal>
  )
}
