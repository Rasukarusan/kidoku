import { truncate } from '@/utils/string'
import { Book } from '@/types/book'
import { useState } from 'react'
import { BookDetailSidebar } from './BookDetailSidebar'
import { useSession } from 'next-auth/react'
import { MemoPreview } from './MemoPreview'
import { useRouter } from 'next/router'

interface Props {
  books: Book[]
}

export const BookRows: React.FC<Props> = ({ books }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const pc = 'hidden sm:table-cell'
  const [openSidebar, setOpenSidebar] = useState(false)
  const [sidebarBook, setSidebarBook] = useState<Book | null>(null)

  const onClickRow = (book: Book) => {
    setSidebarBook(book)
    setOpenSidebar(true)
    // 詳細ページをプリフェッチしてレスポンス速度を向上
    router.prefetch(`/books/${book.id}`)
  }

  const isMine =
    session && books.length > 0 && session.user.id === books[0].userId

  return (
    <div className="relative mb-12 overflow-x-auto">
      <table className="w-full border text-left text-sm text-gray-500">
        <thead className="hidden bg-gray-50 text-xs uppercase text-gray-700 sm:table-header-group">
          <tr>
            <th scope="col" className="px-4 py-3">
              No
            </th>
            <th scope="col" className="px-6 py-3">
              タイトル
            </th>
            <th scope="col" className="px-6 py-3">
              著者
            </th>
            <th scope="col" className="whitespace-nowrap px-6 py-3">
              カテゴリ
            </th>
            <th scope="col" className="whitespace-nowrap px-6 py-3">
              感想
            </th>
            <th scope="col" className="px-6 py-3">
              一言
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <tr
              className="border-b bg-white hover:cursor-pointer hover:bg-gray-50"
              key={`${book.title}-${i}`}
              onClick={() => onClickRow(book)}
            >
              <td className="p-2 text-center">{i + 1}</td>
              <th
                scope="row"
                className="px-4 py-2 font-medium text-gray-900 sm:px-6"
              >
                <div className="flex items-center">
                  <img
                    className="object-contain"
                    src={book.image}
                    alt={book.title}
                    width={50}
                    loading="lazy"
                  />
                  <div className="px-4">
                    <div className="hidden sm:table-cell sm:whitespace-nowrap">
                      {truncate(book.title, 20)}
                    </div>
                    <div className="sm:hidden">{book.title}</div>
                    <div className="mt-1 flex justify-between sm:hidden">
                      <div className="pr-2 text-gray-500">{book.author}</div>
                      <div className="text-gray-500">{book.impression}</div>
                    </div>
                  </div>
                </div>
              </th>
              <td className={`px-6 py-2 ${pc}`}>{book.author}</td>
              <td className={`px-6 py-2 ${pc} whitespace-nowrap`}>
                {book.category}
              </td>
              <td className={`px-6 py-2 ${pc}`}>{book.impression}</td>
              {(isMine || book.isPublicMemo) && (
                <td className={`whitespace-normal px-6 py-2 ${pc}`}>
                  <div className="line-clamp-2">
                    <MemoPreview memo={book.memo} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <BookDetailSidebar
        open={openSidebar}
        book={sidebarBook}
        onClose={() => {
          setOpenSidebar(false)
          setSidebarBook(null)
        }}
        onExpandToFullPage={() => {
          if (sidebarBook) {
            router.push(`/books/${sidebarBook.id}`)
            setOpenSidebar(false)
          }
        }}
      />
    </div>
  )
}
