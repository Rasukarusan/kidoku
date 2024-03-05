import { useEffect, useState } from 'react'
import { AiGenerateButton } from './AiGenerateButton'
import { Error } from './Error'
import { Empty } from './Empty'
import { AiSummary } from './AiSummary'
import type { AiSummariesJson } from './types'
import { Loading } from './Loading'

interface Props {
  username: string
  aiSummaries?: AiSummariesJson
  bookCount: number
  sheet: string
  isTotal: boolean
  isMine: boolean
}
export const AiSummaries: React.FC<Props> = ({
  username,
  aiSummaries,
  bookCount,
  sheet,
  isTotal,
  isMine,
}) => {
  const minimum = 1
  const [json, setJson] = useState(aiSummaries)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onClickGenerate = async () => {
    if (loading) return
    setLoading(true)
    const res = await fetch('/api/ai-summary', {
      method: 'POST',
      body: JSON.stringify({ sheetName: sheet, isTotal }),
    }).then((res) => res.json())
    if (!res.result) {
      setError('AI分析に失敗しました')
    } else {
      setJson(res.data)
    }
  }

  useEffect(() => {
    setJson(aiSummaries)
  }, [sheet])

  if (!json) {
    if (error) {
      return <Error text={error} />
    } else if (
      process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 !== 'true' ||
      bookCount < minimum ||
      !isMine
    ) {
      return <Empty />
    }
    if (loading) {
      return <Loading />
    }
    if (process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true') {
      return <AiGenerateButton onClick={onClickGenerate} loading={loading} />
    }
  }
  return (
    <div className="mx-auto w-full sm:w-3/4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.keys(json).map((key, value) => {
          return (
            <div key={key} className="rounded-md bg-[#f7f6f3] px-8 py-4">
              <AiSummary key={key} jsonKey={key} text={json[key]} />
            </div>
          )
        })}
      </div>
      <div className="w-full pt-1 text-left text-xs text-gray-400 sm:text-right">
        ※読書履歴(カテゴリ、公開中のメモ)に基づきAIが生成しています。
      </div>
    </div>
  )
}
