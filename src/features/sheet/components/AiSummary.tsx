import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { FaRegLightbulb } from 'react-icons/fa6'
import { Fragment } from 'react'
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
  json?: AiSummaryJson
}
export const AiSummary: React.FC<Props> = ({ username, json }) => {
  if (!json) {
    return (
      <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
        <FaNotEqual color="a782c3" className="mr-2" />
        AIの分析結果はありません。
      </div>
    )
  }
  return (
    <div className="mx-auto w-full sm:w-3/4">
      <div className="rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4">
        {Object.keys(json).map((key) => {
          return <Item key={key} itemKey={key} text={json[key]} />
        })}
      </div>
      <div className="pt-1 text-right text-xs text-gray-400">
        ※ {username}の読書履歴に基づきAIが生成しています。
      </div>
    </div>
  )
}
