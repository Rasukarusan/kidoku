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
  const pc = 'hidden sm:table-cell'

  const onClickImage = (book: Record) => {
    setSelectBook(book)
    setOpen(true)
  }

  return (
    <div className="overflow-x-auto relative mb-12">
      <table className="w-full text-sm text-left text-gray-500 border">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 hidden sm:table-header-group">
          <tr>
            <th scope="col" className="py-3 px-4">
              No
            </th>
            <th scope="col" className="py-3 px-6">
              タイトル
            </th>
            <th scope="col" className="py-3 px-6">
              著者
            </th>
            <th scope="col" className="py-3 px-6">
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
              <td className={`py-4 text-center ${pc}`}>{i + 1}</td>
              <th
                scope="row"
                className="py-4 px-4 sm:px-6 font-medium text-gray-900 sm:whitespace-nowrap"
              >
                <div className="flex items-center">
                  <img
                    className="object-contain"
                    src={book.image}
                    alt={book.title}
                    width={50}
                  />
                  <div className="px-4">
                    <div className="hidden sm:table-cell">
                      {truncate(book.title, 20)}
                    </div>
                    <div className="sm:hidden">{book.title}</div>
                    <div className="flex justify-between mt-1 sm:hidden">
                      <div className="text-gray-500 pr-2">{book.author}</div>
                      <div className="text-gray-500">{book.impression}</div>
                    </div>
                  </div>
                </div>
              </th>
              <td className={`py-4 px-6 ${pc}`}>{book.author}</td>
              <td className={`py-4 px-6 ${pc}`}>{book.category}</td>
              <td className={`py-4 px-6 ${pc}`}>{book.impression}</td>
              {isLogin && (
                <td
                  className={`py-4 px-6 whitespace-nowrap sm:whitespace-normal ${pc}`}
                >
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
