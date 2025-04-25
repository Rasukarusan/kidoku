export interface Props {
  book: {
    title: string
    author: string
    order: number
    image: string
  }
}
export const Book: React.FC<Props> = ({ book }) => {
  const { title, author, order, image } = book
  const color = order === 1 ? 'gold' : order === 2 ? 'silver' : 'bronze'
  const styleOrder =
    order === 3
      ? 'order-3 sm:order-none'
      : order === 2
        ? 'order-2 sm:order-2'
        : 'order-1 sm:order-1'
  return (
    <div className={`mb-5 w-full sm:mb-0 sm:w-1/3 ${styleOrder}`}>
      <div className={`mb-2 text-3xl font-bold text-transparent ${color}`}>
        {order}位
      </div>
      <a
        href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
        target="_blank"
        rel="noreferrer"
      >
        <img
          className="m-auto mb-4 shadow-md"
          src={image}
          width={128}
          height={186}
          alt=""
          loading="lazy"
        />
      </a>
      <div className="mb-2">{title}</div>
      <div className="mb-4 text-xs">{author}</div>
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
