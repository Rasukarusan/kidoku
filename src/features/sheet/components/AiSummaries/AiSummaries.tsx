import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { FaRegLightbulb } from 'react-icons/fa6'
import { Fragment, useEffect, useState } from 'react'
import { AiGenerateButton } from './AiGenerateButton'
import { Error } from './Error'
import { Empty } from './Empty'

export type AiSummariesJson = {
  reading_trend_analysis: string
  sentiment_analysis: string
  what_if_scenario: string
  overall_feedback: string
}

const Item = ({ itemKey, text }) => {
  let Icon = MdOutlineSentimentSatisfied
  let title = ''
  switch (itemKey) {
    case 'reading_trend_analysis':
      title = '読書傾向'
      Icon = IoIosAnalytics
      break
    case 'sentiment_analysis':
      title = '感情分析'
      Icon = MdOutlineSentimentSatisfied
      break
    case 'what_if_scenario':
      title = '「もしも」シナリオ'
      Icon = FaRegLightbulb
      break
    case 'overall_feedback':
      title = 'まとめ'
      Icon = IoSparklesSharp
      break

    default:
      break
  }
  return (
    <>
      <div className="flex items-center justify-center py-2">
        <Icon color="a782c3" className="mr-2" />
        <div className="font-bold text-gray-700">{title}</div>
      </div>
      <div className="flex justify-center pb-2 text-sm text-gray-700">
        {text}
      </div>
    </>
  )
}

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
  const [generating, setGenerating] = useState(false)

  const onClickGenerate = async () => {
    if (generating) return
    setGenerating(true)
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
    if (process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true') {
      return (
        <AiGenerateButton onClick={onClickGenerate} generating={generating} />
      )
    }
  }
  return (
    <div className="mx-auto w-full sm:w-3/4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.keys(json).map((key) => {
          return (
            <div key={key} className="rounded-md bg-[#f7f6f3] px-8 py-4">
              <Item key={key} itemKey={key} text={json[key]} />
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
