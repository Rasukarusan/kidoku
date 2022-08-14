import { Box } from '@mui/material'
import { Book, BookProps } from './'

import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  title: {
    fontSize: '30px',
    position: 'relative',
    padding: '0.25em 3em',
    borderTop: 'solid 2px black',
    borderBottom: 'solid 2px black',
    '&::before': {
      content: "''",
      position: 'absolute',
      top: '-7px',
      width: '2px',
      height: 'calc(100% + 14px)',
      backgroundColor: 'black',
      left: '7px',
    },
    '&::after': {
      content: "''",
      position: 'absolute',
      top: '-7px',
      width: '2px',
      height: 'calc(100% + 14px)',
      backgroundColor: 'black',
      right: '7px',
    },
  },
})

interface Props {
  year: string
  books: BookProps[]
}

export const RankingItem: React.FC<Props> = ({ year, books }) => {
  const classes = useStyles()
  return (
    <Box sx={{ marginBottom: '50px' }}>
      <span className={classes.title}>{year}</span>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '30px',
        }}
      >
        {books.map((book) => (
          <Book
            key={book.link}
            rank={book.rank}
            image={book.image}
            link={book.link}
            name={book.name}
          />
        ))}
      </Box>
    </Box>
  )
}
