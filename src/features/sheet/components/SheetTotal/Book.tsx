import { makeStyles } from '@mui/styles'
const useStyles = makeStyles({
  image: {
    margin: '0 auto',
    boxShadow: '0 5px 15px rgb(0 0 0 / 15%)',
  },
  order: {
    color: 'transparent',
    fontSize: '30px',
    fontWeight: 700,
  },
  gold: {
    background:
      'repeating-linear-gradient(0deg, #B67B03 0.1em, #DAAF08 0.2em, #FEE9A0 0.3em, #DAAF08 0.4em, #B67B03 1.2em)',
    WebkitBackgroundClip: 'text',
  },
  silver: {
    background:
      'linear-gradient(45deg, #757575 0%, #9E9E9E 45%, #E8E8E8 70%, #9E9E9E 85%, #757575 90% 100%)',
    WebkitBackgroundClip: 'text',
  },
  bronze: {
    background: '#804A00',
    WebkitBackgroundClip: 'text',
  },
  link: {
    color: '#000',
    fontWeight: 500,
  },
})

export interface BookProps {
  book: {
    title: string
    author: string
    order: number
    image: string
  }
}
export const Book: React.FC<BookProps> = ({ book }) => {
  const classes = useStyles()
  const { title, author, order, image } = book
  const color =
    order === 1 ? classes.gold : order === 2 ? classes.silver : classes.bronze
  const styleOrder =
    order === 3
      ? 'order-3 sm:order-none'
      : order === 2
      ? 'order-2 sm:order-2'
      : 'order-1 sm:order-1'
  return (
    <div className={`w-full sm:w-1/3 mb-5 sm:mb-0 ${styleOrder}`}>
      <div className={`${classes.order} ${color}`}>{order}位</div>
      <a
        href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
        target="_blank"
        rel="noreferrer"
      >
        <img
          className="m-auto shadow-md mb-4"
          src={image}
          width={128}
          height={186}
          alt=""
        />
      </a>
      <div className="mb-2">{title}</div>
      <div className="mb-4 text-xs">{author}</div>
    </div>
  )
}
