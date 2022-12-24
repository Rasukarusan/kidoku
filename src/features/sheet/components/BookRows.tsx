import { useRecoilValue } from 'recoil'
import { isLoginAtom } from '@/store/isLogin'
import { truncate } from '@/utils/string'
import { Record } from '../types'
import { BookDetailDialog } from './BookDetailDialog'
import { useState } from 'react'

interface Props {
  books: Record[]
}

export const BookRows: React.FC<Props> = ({ books }) => {
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Record>(null)
  const isLogin = useRecoilValue(isLoginAtom)

  const onClickImage = (book: Record) => {
    setSelectBook(book)
    setOpen(true)
  }

  return (
    <div className="overflow-x-auto relative mb-12">
      <table className="w-full text-sm text-left text-gray-500 border">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              No
            </th>
            <th scope="col" className="py-3 px-6 hidden sm:table-cell">
              書影
            </th>
            <th scope="col" className="py-3 px-6">
              タイトル
            </th>
            <th scope="col" className="py-3 px-6">
              著者
            </th>
            <th scope="col" className="py-3 px-6 hidden sm:table-cell">
              カテゴリ
            </th>
            <th scope="col" className="py-3 px-6">
              感想
            </th>
            {isLogin && (
              <th scope="col" className="py-3 px-6">
                一言
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <tr
              className="bg-white border-b hover:bg-gray-50 hover:cursor-pointer"
              key={`${book.title}-${i}`}
              onClick={() => onClickImage(book)}
            >
              <td className="py-4 px-6">{i + 1}</td>
              <td className="py-4 px-6 hidden sm:table-cell">
                <img src={book.image} alt={book.title} width={120} />
              </td>
              <th
                scope="row"
                className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
              >
                {truncate(book.title, 20)}
              </th>
              <td className="py-4 px-6">{book.author}</td>
              <td className="py-4 px-6 hidden sm:table-cell">
                {book.category}
              </td>
              <td className="py-4 px-6">{book.impression}</td>
              {isLogin && (
                <td className="py-4 px-6 whitespace-nowrap sm:whitespace-normal">
                  {truncate(book.memo, 40)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <BookDetailDialog
        open={open}
        book={selectBook}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
