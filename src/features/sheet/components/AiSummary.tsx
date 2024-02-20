import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import {
  MdOutlineRestartAlt,
  MdOutlineSentimentSatisfied,
} from 'react-icons/md'
import { FaCircleNotch, FaRegLightbulb } from 'react-icons/fa6'
import { Fragment, useEffect, useState } from 'react'
import { FaNotEqual } from 'react-icons/fa'

export type AiSummaryJson = {
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
      <div className="pb-2 text-sm text-gray-700">{text}</div>
    </>
  )
}

interface Props {
  username: string
  aiSummary?: AiSummaryJson
  bookCount: number
  sheet: string
  isTotal: boolean
  isMine: boolean
}
export const AiSummary: React.FC<Props> = ({
  username,
  aiSummary,
  bookCount,
  sheet,
  isTotal,
  isMine,
}) => {
  const minimum = 1
  const [json, setJson] = useState(aiSummary)
  const [generating, setGenerating] = useState(false)
  const onClickGenerateAiSummary = async () => {
    if (generating) return
    setGenerating(true)
    const res = await fetch('/api/ai-summary', {
      method: 'POST',
      body: JSON.stringify({ sheetName: sheet, isTotal }),
    }).then((res) => res.json())
    setJson(res.data)
  }

  useEffect(() => {
    setJson(aiSummary)
  }, [sheet])

  if (!json) {
    if (
      process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 !== 'true' ||
      bookCount < minimum ||
      !isMine
    ) {
      return (
        <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
          <FaNotEqual className="mr-2-2 text-ai" />
          AIの分析結果はありません。
        </div>
      )
    }
    if (process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true') {
      return (
        <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
          <button
            type="button"
            className="flex items-center rounded-md px-2 py-1 hover:font-bold"
            onClick={onClickGenerateAiSummary}
          >
            {generating ? (
              <FaCircleNotch size={25} className="mr-2 animate-spin text-ai" />
            ) : (
              <MdOutlineRestartAlt size={25} className="mr-2 text-ai" />
            )}
            {generating ? (
              <span className="animate-pulse">AI分析中...</span>
            ) : (
              <span className="underline">AIの分析を始める</span>
            )}
          </button>
        </div>
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
