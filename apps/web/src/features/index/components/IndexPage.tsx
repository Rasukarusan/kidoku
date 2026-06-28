import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { openSearchModalAtom } from '@/store/modal/atom'

interface Props {
  comments: Comment[]
}

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

  // 本の検索モーダルを開く（登録時にログインが必要なら都度案内される）
  const handleStart = () => {
    setOpenSearchModal(true)
  }

  return (
    <>
      {/* ヒーロー：淡々と記録する、を伝えるミニマルなファーストビュー */}
      <section className="border-b border-gray-100">
        <Container className="px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-2xl font-bold leading-relaxed tracking-wide text-gray-800 sm:text-3xl">
              読んだ本を、ただ記録する。
            </h1>
            <p className="mt-6 text-sm leading-loose text-gray-500 sm:text-base">
              派手な機能も、難しい操作もいりません。
              <br />
              日々読み終えた本を、自分のペースで淡々と。
              <br />
              ずっと続けられる、シンプルな読書記録。
            </p>
            <div className="mt-10">
              <button
                onClick={handleStart}
                className="rounded-full border border-gray-800 px-10 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-800 hover:text-white"
              >
                記録をはじめる
              </button>
            </div>
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
