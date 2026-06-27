import { useAtom } from 'jotai'
import { useSession } from 'next-auth/react'
import { FiShare2, FiArrowRight } from 'react-icons/fi'
import { FaRedo } from 'react-icons/fa'
import { shareToSns } from '@/utils/socialShare'
import { openLoginModalAtom } from '@/store/modal/atom'
import { SearchResult } from '@/types/search'

interface Props {
  characterSummary: string
  comment: string
  books: SearchResult[]
  onRetry: () => void
}

export const DiagnosisResult: React.FC<Props> = ({
  characterSummary,
  comment,
  books,
  onRetry,
}) => {
  const host = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'
  const { status } = useSession()
  const [, setOpenLoginModal] = useAtom(openLoginModalAtom)

  const shareUrl = `${host}/diagnosis`
  const shareText = `私の読書性格は「${characterSummary}」でした📚✨\n読んだ本からAIが性格診断してくれるやつ。あなたもやってみて👇\n#kidoku #読書性格診断`

  return (
    <div className="text-center">
      <div className="rounded-2xl bg-gradient-to-br from-purple-100 via-pink-50 to-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
          あなたの読書性格
        </p>
        <h2 className="mt-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-2xl font-bold leading-snug text-transparent sm:text-3xl">
          {characterSummary}
        </h2>
        {comment && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-700">
            {comment}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {books.map((book) => (
            <span
              key={book.id}
              className="rounded-full bg-white/70 px-3 py-1 text-xs text-gray-600 shadow-sm"
            >
              {book.title}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={() => shareToSns(shareText, shareUrl)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 hover:brightness-105 sm:w-auto"
        >
          <FiShare2 size={18} />
          結果をシェア
        </button>
        <button
          onClick={onRetry}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-base font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
        >
          <FaRedo size={14} />
          もう一度診断する
        </button>
      </div>

      {status !== 'authenticated' && (
        <div className="mt-8 rounded-xl border border-purple-100 bg-purple-50/50 p-5">
          <p className="text-sm text-gray-700">
            これは3冊だけの<strong>かんたん診断</strong>です。
            <br className="sm:hidden" />
            本棚を登録すると、読書履歴まるごとの本格AI分析や年間まとめが作れます。
          </p>
          <button
            onClick={() => setOpenLoginModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-800 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            無料で本棚をつくる
            <FiArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
