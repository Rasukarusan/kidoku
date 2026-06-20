import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { BuiltInProviderType } from 'next-auth/providers/index'
import { ClientSafeProvider, LiteralUnion } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { FaBookOpen, FaRobot, FaShareAlt } from 'react-icons/fa'
import { Loading } from '@/components/icon/Loading'

interface Props {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >
}

const STEPS = [
  {
    icon: FaBookOpen,
    title: '読んだ本を記録',
    desc: 'タイトル検索やバーコードでかんたんに登録。',
  },
  {
    icon: FaRobot,
    title: 'AIが読書性格を分析',
    desc: '記録が貯まると、あなたの読書傾向をAIが診断。',
  },
  {
    icon: FaShareAlt,
    title: '結果をシェア',
    desc: '診断結果や年間まとめを1枚の画像でシェアできる。',
  },
]

export const AuthInitPage: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    setLoading(true)
    try {
      await fetch(`/api/auth/init`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { Accept: 'application/json' },
      }).then((res) => res.json())
      // 最初の1冊登録（aha体験）へ誘導
      location.href = '/?start=1'
    } catch {
      setLoading(false)
    }
  }

  return (
    <Container>
      <NextSeo title="Welcome! | kidoku" />
      <div className="mx-auto max-w-lg p-6 text-center">
        <h2 className="mb-2 mt-4 text-3xl font-bold">ようこそ kidoku へ</h2>
        <p className="mb-8 text-gray-600">読書を記録して、もっと楽しく。</p>

        <div className="mb-10 space-y-4 text-left">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-bold">
                    {i + 1}. {step.title}
                  </div>
                  <div className="text-sm text-gray-500">{step.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
          onClick={onClick}
          disabled={loading}
        >
          {loading ? (
            <Loading className="h-5 w-5 border-2 border-white" />
          ) : (
            '最初の1冊を登録する'
          )}
        </button>
      </div>
    </Container>
  )
}
