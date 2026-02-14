import Link from 'next/link'

export interface Props {
  book: {
    id: number
    title: string
    author: string
    order: number
    image: string
    memo: string
    is_public_memo: boolean
  }
}
export const Book: React.FC<Props> = ({ book }) => {
  const { id, title, author, order, image, memo, is_public_memo } = book
  const color = order === 1 ? 'gold' : order === 2 ? 'silver' : 'bronze'
  return (
    <div className="mb-6 flex gap-4 text-left sm:gap-6">
      <div className="flex shrink-0 flex-col items-center">
        <div className={`mb-2 text-2xl font-bold text-transparent ${color}`}>
          {order}位
        </div>
        <a
          href={encodeURI(`https://www.amazon.co.jp/s?k=${title}`)}
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="shadow-md"
            src={image}
            width={100}
            height={145}
            alt=""
            loading="lazy"
          />
        </a>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <Link
          href={`/books/${id}`}
          className="mb-1 text-sm font-bold leading-tight hover:underline sm:text-base"
        >
          {title}
        </Link>
        <div className="mb-2 text-xs text-gray-500">{author}</div>
        {is_public_memo ? (
          memo && (
            <div className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-gray-700 sm:text-sm">
              {memo}
            </div>
          )
        ) : (
          <div className="text-xs text-gray-400 sm:text-sm">
            非公開の感想です
          </div>
        )}
      </div>
      <style jsx>{`
        .gold {
          background:
            repeating-linear-gradient(0deg, #B67B03 0.1em, #DAAF08 0.2em, #FEE9A0 0.3em, #DAAF08 0.4em, #B67B03 1.2em);
            -webkit-background-clip: text;
        }
        .silver {
          background:
            linear-gradient(45deg, #757575 0%, #9E9E9E 45%, #E8E8E8 70%, #9E9E9E 85%, #757575 90% 100%);
            -webkit-background-clip: text;
        }
        .bronze {
          background: #804A00;
          -webkit-background-clip: text;
        },
      `}</style>
    </div>
  )
}
