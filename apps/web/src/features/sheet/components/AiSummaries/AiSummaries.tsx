import { AiGenerateButton } from './AiGenerateButton'
import { Error } from './Error'
import { AiSummary } from './AiSummary'
import type { AiSummariesJson } from './types'
import { AiReGenerateButton } from './AiReGenerateButton'
import useAiHelpers from './useAiHelpers'
import { Confirm } from './Confirm'
import { StepIndicator } from './StepIndicator'
import { CourseId } from '@/types/user'
import { Book } from '@/types/book'
import { FaCircleNotch, FaTrash } from 'react-icons/fa'

interface Props {
  username: string
  aiSummaries: AiSummariesJson[]
  bookCount: number
  sheet: string
  isMine: boolean
  books: Book[]
}
export const AiSummaries: React.FC<Props> = ({
  aiSummaries,
  sheet,
  isMine,
  books,
}) => {
  const {
    generateSummary,
    deleteSummary,
    loading,
    deleting,
    json,
    setJson,
    error,
    open,
    setOpen,
    summaryIndex,
    setSummaryIndex,
  } = useAiHelpers(sheet, aiSummaries)

  if (error) {
    return <Error text={error} />
  }

  return (
    <>
      {isMine && (
        <div className="text-center">
          <Confirm
            open={open}
            onCancel={() => setOpen(false)}
            onConfirm={async (settings) => {
              setOpen(false)
              await generateSummary(sheet, settings.months, settings.categories)
            }}
            onManualSet={(json) => setJson(json)}
            courseId={CourseId.Free}
            sheetName={sheet}
            books={books}
          />
          {loading ? null : json ? (
            <AiReGenerateButton
              onClick={() => setOpen(true)}
              sheet={sheet}
              disabled={loading}
            />
          ) : (
            <AiGenerateButton
              onClick={() => setOpen(true)}
              sheet={sheet}
              disabled={loading}
            />
          )}
        </div>
      )}
      {loading && (
        <div className="mx-auto mb-4 flex w-full items-center justify-center rounded-lg bg-ai-summary bg-gradient-to-b p-4 text-center text-gray-700 md:w-3/4">
          <div className="flex items-center rounded-md px-2 py-1 hover:font-bold">
            <FaCircleNotch size={25} className="mr-2 animate-spin text-ai" />
            <span className="animate-pulse">AI分析中...</span>
          </div>
        </div>
      )}
      {json && (
        <div className="relative mx-auto w-full text-center md:w-3/4">
          {isMine && (
            <button
              onClick={() => {
                if (window.confirm('AI分析結果を削除しますか？')) {
                  deleteSummary(json.id)
                }
              }}
              disabled={deleting}
              className="absolute -top-6 right-0 flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
              title="AI分析結果を削除"
            >
              {deleting ? (
                <FaCircleNotch size={14} className="animate-spin" />
              ) : (
                <FaTrash size={14} />
              )}
              <span>削除</span>
            </button>
          )}
          {json.character_summary && (
            <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 shadow-sm">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                一言でいうとこんな人
              </h3>
              <p className="text-xl font-bold leading-relaxed text-gray-800">
                {json.character_summary}
              </p>
            </div>
          )}
          <div className="mb-1 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.keys(json)
              .filter((key) => key !== 'id' && key !== 'character_summary')
              .map((key) => {
                return (
                  <div key={key} className="rounded-md bg-ai-summary px-8 py-4">
                    <AiSummary key={key} jsonKey={key} text={json[key]} />
                  </div>
                )
              })}
          </div>
          <div className="flex items-baseline justify-between gap-4 text-xs text-gray-400">
            <span className="shrink text-left">
              ※読書履歴(カテゴリ、公開中のメモ)に基づきAIが生成しています。
            </span>
            {aiSummaries.length > 1 && (
              <StepIndicator
                step={summaryIndex}
                maxStep={aiSummaries.length}
                onBack={() => {
                  if (summaryIndex === 0) return
                  setSummaryIndex(summaryIndex - 1)
                }}
                onNext={() => {
                  const newSummaryIndex = summaryIndex + 1
                  if (newSummaryIndex === aiSummaries.length) return
                  setSummaryIndex(newSummaryIndex)
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
