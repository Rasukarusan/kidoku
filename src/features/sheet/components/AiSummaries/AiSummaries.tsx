import { AiGenerateButton } from './AiGenerateButton'
import { Error } from './Error'
import { Empty } from './Empty'
import { AiSummary } from './AiSummary'
import type { AiSummariesJson } from './types'
import { Loading } from './Loading'
import { AiReGenerateButton } from './AiReGenerateButton'
import useAiHelpers from './useAiHelpers'
import { Confirm } from './Confirm'
import { StepIndicator } from './StepIndicator'
import { CourseId } from '@/types/user'
import { Book } from '@/types/book'

interface Props {
  username: string
  aiSummaries: AiSummariesJson[]
  bookCount: number
  sheet: string
  isMine: boolean
  books: Book[]
}
export const AiSummaries: React.FC<Props> = ({
  username,
  aiSummaries,
  bookCount,
  sheet,
  isMine,
  books,
}) => {
  const minimum = 1
  const {
    generateSummary,
    loading,
    json,
    setJson,
    error,
    open,
    setOpen,
    summaryIndex,
    setSummaryIndex,
  } = useAiHelpers(sheet, aiSummaries)

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error text={error} />
  }

  // 以下はNEXT_PUBLIC_FLAG_KIDOKU_2=trueにしたら丸ごと不要になる。AiGenerateButtonが同じ役割を果たすため。
  if (
    !json &&
    (process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 !== 'true' ||
      bookCount < minimum ||
      !isMine)
  ) {
    return <Empty />
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
          {json ? (
            <AiReGenerateButton onClick={() => setOpen(true)} sheet={sheet} />
          ) : (
            <AiGenerateButton onClick={() => setOpen(true)} sheet={sheet} />
          )}
        </div>
      )}
      {json && (
        <div className="relative mx-auto w-full text-center sm:w-3/4">
          <div className="mb-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.keys(json).map((key, value) => {
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
