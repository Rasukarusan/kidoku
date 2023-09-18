import { Fragment } from 'react'
import { Record } from '../types'
import { Divider } from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import { useSession } from 'next-auth/react'

interface Props {
  book: Record
  onClick: () => void
}

export const BookDetailRead: React.FC<Props> = ({ book, onClick }) => {
  const { data: session } = useSession()
  return (
    <div className="p-4">
      <div className="flex items-start">
        <div className="w-1/3 mr-4">
          <a
            href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="mx-auto my-0 drop-shadow-lg"
              src={book.image}
              alt={book.title}
            />
          </a>
        </div>
        <div className="w-[50%] mr-2">
          <div className="font-bold text-xl mb-2">
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
              target="_blank"
              rel="noreferrer"
            >
              {book.title}
            </a>
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <PeopleAltIcon />
            </span>
            <span className="pl-2">{book.author}</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <CategoryIcon />
            </span>
            <span className="pl-2">{book.category}</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <InsertEmoticonIcon />
            </span>
            <span className="pl-2">{book.impression}</span>
          </div>
        </div>
        <button
          className="bg-light px-4 py-1 font-bold text-white rounded-md"
          onClick={onClick}
        >
          編集
        </button>
      </div>
      {session && (
        <>
          <Divider sx={{ margin: '15px 0px' }} />
          <Memo memo={book.memo} />
        </>
      )}
    </div>
  )
}

/**
 * \nを<br>に変換したコンポーネント
 */
export const Memo = ({ memo }) => {
  const texts = memo.split(/(\n)/).map((item, index) => {
    return <Fragment key={index}>{item.match(/\n/) ? <br /> : item}</Fragment>
  })
  return <div className="p-2">{texts}</div>
}
