import { IoSparklesSharp } from 'react-icons/io5'
import { IoIosAnalytics } from 'react-icons/io'
import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { FaRegLightbulb } from 'react-icons/fa6'
import { FaUser } from 'react-icons/fa6'
import { IconType } from 'react-icons'

/**
 * AI分析フィールドの定義
 * 各フィールドのUIメタデータを一元管理
 */
export const AI_SUMMARY_FIELDS = {
  character_summary: {
    title: '一言でいうとこんな人',
    icon: FaUser as IconType,
    maxLength: 50,
  },
  reading_trend_analysis: {
    title: '読書傾向',
    icon: IoIosAnalytics as IconType,
    maxLength: 400,
  },
  sentiment_analysis: {
    title: '感情分析',
    icon: MdOutlineSentimentSatisfied as IconType,
    maxLength: 400,
  },
  hidden_theme_discovery: {
    title: '無意識に追いかけているもの',
    icon: FaRegLightbulb as IconType,
    maxLength: 400,
  },
  overall_feedback: {
    title: 'まとめ',
    icon: IoSparklesSharp as IconType,
    maxLength: 400,
  },
} as const

export type AiSummaryFieldKey = keyof typeof AI_SUMMARY_FIELDS
