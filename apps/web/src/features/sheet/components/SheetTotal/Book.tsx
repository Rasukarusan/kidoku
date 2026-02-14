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
  const ribbonClass =
    order === 1
      ? 'ribbon-gold'
      : order === 2
        ? 'ribbon-silver'
        : 'ribbon-bronze'
  return (
    <div className="mb-6 flex gap-4 text-left sm:gap-6">
      <div className="relative shrink-0">
        <div className={`ribbon ${ribbonClass}`}>
          <span className="ribbon-text">{order}</span>
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
        .ribbon {
          position: absolute;
          top: -4px;
          left: 6px;
          width: 26px;
          height: 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          z-index: 10;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
        }
        .ribbon-text {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          line-height: 1;
        }
        .ribbon-gold {
          background: linear-gradient(
            180deg,
            #fce38a 0%,
            #f7b731 25%,
            #d4a017 55%,
            #b8860b 100%
          );
        }
        .ribbon-silver {
          background: linear-gradient(
            180deg,
            #f0f0f0 0%,
            #d0d0d0 25%,
            #a8a8a8 55%,
            #808080 100%
          );
        }
        .ribbon-bronze {
          background: linear-gradient(
            180deg,
            #e8a468 0%,
            #cd8c3e 25%,
            #a0622e 55%,
            #804a00 100%
          );
        }
      `}</style>
    </div>
  )
}
