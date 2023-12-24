import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { FaRegLightbulb } from 'react-icons/fa6'
import { Fragment } from 'react'

const aiSummary = `
{
  "reading_trend_analysis": "あなたは金融、技術、そして自己成長に関する本に興味を持っているようです。特に仮想通貨やマネジメント関連の書籍に目が行っており、新しい知識や技術を学ぶことに積極的です。多様なジャンルに手を出しており、特定の分野に偏らず広範囲の知識を得ようとしている傾向が見られます。",
  "sentiment_analysis": "読んだ本に対しては基本的に好奇心を持ち、新しいことを学べたときにはポジティブな感想を持っています。しかし、期待外れの内容や、自分の興味と合わない本には批判的で、そのような本には失望感を示しています。",
  "what_if_scenario": "もしもあなたがこれまでとは異なるジャンル、例えば歴史や哲学の本に挑戦したら、新たな視野や考え方に触れることができ、読書の幅がさらに広がるかもしれません。特に歴史は現在の金融システムや社会構造を深く理解する上で役立つ可能性があり、哲学は自己反省や思考の深化に繋がり、マネジメントスキルにも活かせるかもしれません。",
  "overall_feedback": "あなたの読書傾向は知的好奇心が強く、幅広い分野に手を伸ばしていることが伺えます。自己成長やスキルアップを目指す姿勢が読書選択にも現れており、特に新しい技術や金融に関する本に興味を持っているようです。ただ、さらなる知識の拡張と視野の広がりを求めて、異なるジャンルの本にも挑戦することで、より豊かな読書体験が期待できそうです。"
}
`

type AiSummaryJson = {
  reading_trend_analysis: string
  sentiment_analysis: string
  what_if_scenario: string
  overall_feedback: string
}

const Item = ({ title, text }) => {
  let Icon = MdOutlineSentimentSatisfied
  switch (title) {
    case '読書傾向':
      Icon = IoIosAnalytics
      break
    case '感情分析':
      Icon = MdOutlineSentimentSatisfied
      break
    case '「もしも」シナリオ':
      Icon = FaRegLightbulb
      break
    case 'まとめ':
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

export const AiSummary: React.FC = () => {
  const json: AiSummaryJson = JSON.parse(aiSummary)
  return (
    <div className="mx-auto w-full sm:w-3/4">
      <div className="rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4">
        <Item title="読書傾向" text={json.reading_trend_analysis} />
        <Item title="感情分析" text={json.sentiment_analysis} />
        <Item title="「もしも」シナリオ" text={json.what_if_scenario} />
        <Item title="まとめ" text={json.overall_feedback} />
      </div>
      <div className="pt-1 text-right text-xs text-gray-400">
        ※ あなたの読書履歴に基づきAIが生成しています。
      </div>
    </div>
  )
}
