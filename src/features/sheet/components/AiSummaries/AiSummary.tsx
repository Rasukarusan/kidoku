import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { FaRegLightbulb } from 'react-icons/fa6'

interface Props {
  jsonKey: string
  text: string
}
export const AiSummary: React.FC<Props> = ({ jsonKey, text }) => {
  let Icon = MdOutlineSentimentSatisfied
  let title = ''
  switch (jsonKey) {
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
