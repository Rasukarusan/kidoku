import { useEffect, useState } from 'react'
import { AiGenerateButton } from './AiGenerateButton'
import { Error } from './Error'
import { Empty } from './Empty'
import { AiSummary } from './AiSummary'
import type { AiSummariesJson } from './types'
import { Loading } from './Loading'
import { Modal } from '@/components/layout/Modal'
import { toggleNoScrollBody } from '@/utils/element'

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
  const [open, setOpen] = useState(false)

  const onClickGenerate = async () => {
    toggleNoScrollBody(false)
    setOpen(false)
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
    setLoading(false)
  }

  useEffect(() => {
    setJson(aiSummaries)
  }, [sheet])

  if (loading) {
    return <Loading />
  }

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
    if (process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true') {
      return <AiGenerateButton onClick={onClickGenerate} loading={loading} />
    }
  }
  return (
    <>
      <div className="relative mx-auto w-full text-center sm:w-3/4">
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 top-0 z-10 m-auto h-36 w-[360px] rounded-md bg-white px-10 py-10 sm:w-[450px]">
            <div className="mb-4 text-sm font-bold">
              前回の内容は削除されます。 よろしいですか？
            </div>
            <div className="flex items-center justify-evenly">
              <button
                className="w-[130px] rounded-md border bg-gray-400 py-2 text-sm text-white hover:brightness-110"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </button>
              <button
                className="w-[130px] rounded-md border border-ai py-2 text-sm text-ai hover:brightness-125"
                onClick={() => {
                  onClickGenerate()
                }}
                disabled={loading}
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
        <button
          className="m-4 rounded-md border border-ai px-6 py-3 text-ai hover:brightness-110"
          onClick={() => setOpen(!open)}
        >
          AI分析を実行する
        </button>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.keys(json).map((key, value) => {
            return (
              <div key={key} className="rounded-md bg-ai-bg px-8 py-4">
                <AiSummary key={key} jsonKey={key} text={json[key]} />
              </div>
            )
          })}
        </div>
        <div className="w-full pt-1 text-left text-xs text-gray-400 sm:text-right">
          ※読書履歴(カテゴリ、公開中のメモ)に基づきAIが生成しています。
        </div>
      </div>
    </>
  )
}
