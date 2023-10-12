import { Fragment } from 'react'
import { Book } from '@/types/book'
import { ToggleButton } from '@/components/button/ToggleButton'
import { useSession } from 'next-auth/react'
import { Loading } from '@/components/icon/Loading'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookInputField } from '@/components/input/BookInputField'

interface Props {
  book: Book
  onClick: () => void
  setBook: (book: Book) => void
  loading: boolean
}

export const BookDetailEdit: React.FC<Props> = ({
  book,
  onClick,
  setBook,
  loading,
}) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  return (
    <>
      <div className="p-4 overflow-y-hidden">
        <div className="flex items-center">
          <ImagePicker
            img={book.image}
            onImageLoad={(image) => setBook({ ...book, image })}
          />
          <div className="w-2/3 mr-2">
            <BookInputField
              value={book?.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              label="タイトル"
              tabIndex={1}
            />
            <BookInputField
              value={book?.author}
              onChange={(e) => setBook({ ...book, author: e.target.value })}
              label="著者"
              tabIndex={2}
            />
            <BookInputField
              value={book?.category}
              onChange={(e) => setBook({ ...book, category: e.target.value })}
              label="カテゴリ"
              tabIndex={3}
            />
            <BookInputField
              value={book?.impression}
              onChange={(e) => setBook({ ...book, impression: e.target.value })}
              label="感想"
              tabIndex={4}
            />
          </div>
        </div>
        {isMine && (
          <>
            <BookInputField
              rows={8}
              value={book?.memo}
              onChange={(e) => setBook({ ...book, memo: e.target.value })}
              label="メモ"
              tabIndex={5}
            />
            <ToggleButton
              label="メモを公開する"
              checked={book.is_public_memo}
              onChange={() => {
                setBook({ ...book, is_public_memo: !book.is_public_memo })
              }}
            />
          </>
        )}
      </div>
      <div className="border-t border-1 text-center w-full">
        <button
          className="hover:bg-green-700 bg-green-600 px-4 py-1 font-bold text-white w-full h-12 flex items-center justify-center"
          onClick={onClick}
          tabIndex={6}
        >
          {loading && (
            <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
          )}
          <span>保存する</span>
        </button>
      </div>
    </>
  )
}
