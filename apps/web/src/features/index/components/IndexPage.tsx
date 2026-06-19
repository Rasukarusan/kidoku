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

  return (
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
  )
}
