import { FaCircleNotch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getTitleAndIcon } from './util'

interface Props {
  jsonKey: string
  text: string
}
export const Loading: React.FC = () => {
  const [json, setJson] = useState({
    reading_trend_analysis: '',
    sentiment_analysis: '',
    what_if_scenario: '',
    overall_feedback: '',
  })
  useEffect(() => {
    const speed = 100
    const delay = [7, 18, 32, 45] // 単位は秒
    const loadingText = {
      reading_trend_analysis:
        '「読書傾向」は、ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化します。これによって今、自分が何を好きなのか、どんなジャンルに対しては前向きなのかなどがわかります。',
      sentiment_analysis:
        '「感情分析」は、ユーザーが読んだ本の感想を分析して、どの本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示します。',
      what_if_scenario:
        '「もしもシナリオ」は、ユーザーが異なるジャンルや著者を選んだ場合にどのような読書体験になるかを想像させる、仮想シナリオを提示します。',
      overall_feedback: '「まとめ」は、まとめです。',
    }
    Object.keys(json).map((key, i) => {
      setTimeout(() => {
        const text = loadingText[key]
        for (let i = 0; i <= text.length; i++) {
          setTimeout(() => {
            setJson((prevJson) => ({
              ...prevJson,
              [key]: text.slice(0, i),
            }))
          }, i * speed)
        }
      }, delay[i] * 1000)
    })
  }, [])
  return (
    <>
      <div className="mx-auto mb-4 flex w-full items-center justify-center rounded-lg bg-ai-bg bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
        <div className="flex items-center rounded-md px-2 py-1 hover:font-bold">
          <FaCircleNotch size={25} className="mr-2 animate-spin text-ai" />
          <span className="animate-pulse">AI分析中...</span>
        </div>
      </div>
      <div className="mx-auto w-full sm:w-3/4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.keys(json).map((key, i) => {
            const { Icon, title } = getTitleAndIcon(key)
            const delay = (1 + i) * (4 * i)
            return (
              <motion.div
                key={key}
                initial={{
                  opacity: 0,
                  y: null,
                }}
                animate={{
                  opacity: [0, 0.5, 1],
                  y: [10, 0],
                }}
                transition={{
                  opacity: {
                    duration: 2,
                    delay,
                  },
                  y: {
                    repeat: Infinity,
                    repeatType: 'reverse',
                    repeatDelay: 0,
                    type: 'spring',
                    duration: 2,
                    delay,
                  },
                }}
                className="rounded-md bg-[#f7f6f3] px-8 py-4"
              >
                <div
                  key={key}
                  className="flex items-center justify-center py-2"
                >
                  <Icon color="a782c3" className="mr-2" />
                  <div className="font-bold text-gray-700">{title}</div>
                </div>
                <div className="pb-2 text-sm text-gray-700">
                  <span className="font-bold">分析中...</span>
                  {json[key]}
                </div>
              </motion.div>
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
