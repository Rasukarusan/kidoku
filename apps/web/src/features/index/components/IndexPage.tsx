import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { openSearchModalAtom } from '@/store/modal/atom'

interface Props {
  comments: Comment[]
}

const FEATURES = [
  {
    emoji: '🤖',
    title: 'AI読書性格診断',
    description:
      '読んだ本からAIがあなたの“読書性格”を分析。SNSでシェアできる診断カードに。',
  },
  {
    emoji: '📊',
    title: '年間読書まとめ',
    description:
      '読了数・よく読んだジャンル・今年のベスト本を1枚にまとめてふりかえり。',
  },
  {
    emoji: '📚',
    title: 'かんたん登録',
    description:
      'タイトル検索やバーコードスキャンで、あなたの本棚を手軽にデジタル化。',
  },
]

export const IndexPage: React.FC<Props> = ({ comments }) => {
  const router = useRouter()
  const [, setOpenSearchModal] = useAtom(openSearchModalAtom)

  // オンボーディング直後（?start=1）は最初の1冊登録モーダルを自動で開く
  useEffect(() => {
    if (router.query.start === '1') {
      setOpenSearchModal(true)
      router.replace('/', undefined, { shallow: true })
    }
  }, [router, setOpenSearchModal])

  return (
    <>
      {/* ヒーロー：初見ユーザーに価値を伝えるファーストビュー */}
      <section className="bg-gradient-to-b from-purple-50 via-pink-50 to-white">
        <Container className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-white/80 px-4 py-1 text-xs font-bold tracking-wide text-purple-600 shadow-sm">
              AI × 読書記録
            </span>
            <h1 className="text-3xl font-bold leading-tight text-gray-800 sm:text-4xl">
              読んだ本から、あなたの
              <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                “読書性格”
              </span>
              がわかる。
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              AIがあなたの読書傾向を分析し、SNSでシェアできる読書まとめをつくります。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/diagnosis"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 hover:brightness-105 sm:w-auto"
              >
                無料で読書性格を診断する
                <FiArrowRight size={18} />
              </Link>
              <Link
                href="/comments"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
              >
                みんなの読書を見る
              </Link>
            </div>
          </div>

          {/* 主要機能の紹介 */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/80 p-5 text-center shadow-sm"
              >
                <div className="text-3xl">{feature.emoji}</div>
                <h2 className="mt-3 text-base font-bold text-gray-800">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="p-6">
        <section>
          <div className="flex items-center">
            <h2 className="p-2 text-2xl font-bold">Comments</h2>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {comments.map((comment) => (
              <BookComment key={comment.id} comment={comment} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/comments" className="text-blue-500 hover:underline">
              さらに表示
            </Link>
          </div>
        </section>
      </Container>
    </>
  )
}
