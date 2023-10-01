import { truncate } from '@/utils/string'
import { Record } from '../types'
import { useState } from 'react'
import { Memo } from './Memo'
import { useSession } from 'next-auth/react'

interface Props {
  books: Record[]
}

export const BookRows: React.FC<Props> = ({ books }) => {
  const [expands, setExpands] = useState(Array(books.length).fill(false))
  const { data: session } = useSession()
  const pc = 'hidden sm:table-cell'

  const onClickRow = (i: number) => {
    const current = expands[i]
    const newExpands = [...expands] //Array(books.length).fill(false)
    newExpands[i] = !current
    setExpands(newExpands)
  }
  const isMine =
    session && books.length > 0 && session.user.id === books[0].userId

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
            <th scope="col" className="py-3 px-6 whitespace-nowrap">
              カテゴリ
            </th>
            <th scope="col" className="py-3 px-6 whitespace-nowrap">
              感想
            </th>
            <th scope="col" className="py-3 px-6">
              一言
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <tr
              className="bg-white border-b hover:bg-gray-50 hover:cursor-pointer"
              key={`${book.title}-${i}`}
              onClick={() => onClickRow(i)}
            >
              <td className={`py-4 text-center ${pc}`}>{i + 1}</td>
              <th
                scope="row"
                className="py-4 px-4 sm:px-6 font-medium text-gray-900"
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
                    <div
                      className={`hidden sm:table-cell ${
                        expands[i]
                          ? 'sm:whitespace-break'
                          : 'sm:whitespace-nowrap'
                      }`}
                    >
                      {expands[i] ? book.title : truncate(book.title, 20)}
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
              <td className={`py-4 px-6 ${pc} whitespace-nowrap`}>
                {book.category}
              </td>
              <td className={`py-4 px-6 ${pc}`}>{book.impression}</td>
              {(isMine || book.is_public_memo) && (
                <td className={`py-4 px-6 whitespace-normal ${pc}`}>
                  {expands[i] ? (
                    <Memo memo={book.memo} />
                  ) : (
                    <span>{truncate(book.memo, 40)}</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
