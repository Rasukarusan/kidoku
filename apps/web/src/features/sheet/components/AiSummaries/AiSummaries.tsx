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
import { FaCircleNotch } from 'react-icons/fa'

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
    loading,
    json,
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
      {process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true' && isMine && (
        <div className="text-center">
          <Confirm
            open={open}
            onCancel={() => setOpen(false)}
            onConfirm={async (settings) => {
              setOpen(false)
              await generateSummary(sheet, settings.months, settings.categories)
            }}
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
        <div className="mx-auto mb-4 flex w-full items-center justify-center rounded-lg bg-ai-summary bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
          <div className="flex items-center rounded-md px-2 py-1 hover:font-bold">
            <FaCircleNotch size={25} className="mr-2 animate-spin text-ai" />
            <span className="animate-pulse">AI分析中...</span>
          </div>
        </div>
      )}
      {json && (
        <div className="relative mx-auto w-full text-center sm:w-3/4">
          <div className="mb-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.keys(json).map((key) => {
              return (
                <div key={key} className="rounded-md bg-ai-summary px-8 py-4">
                  <AiSummary key={key} jsonKey={key} text={json[key]} />
                </div>
              )
            })}
          </div>
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
          <div className="w-full text-left text-xs text-gray-400 sm:text-right">
            ※読書履歴(カテゴリ、公開中のメモ)に基づきAIが生成しています。
          </div>
        </div>
      )}
    </>
  )
}
