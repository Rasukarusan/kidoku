import Image from 'next/image'
import { makeStyles } from '@mui/styles'
import { Box } from '@mui/material'
const useStyles = makeStyles({
  image: {
    boxShadow: '0 5px 15px rgb(0 0 0 / 15%)',
  },
  rank: {
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
    textDecoration: 'none',
    color: '#000',
    fontWeight: 500,
  },
})

export interface BookProps {
  rank: number
  image: string
  link: string
  name: string
}
export const Book: React.FC<BookProps> = ({ rank, image, link, name }) => {
  const classes = useStyles()
  const color =
    rank === 1 ? classes.gold : rank === 2 ? classes.silver : classes.bronze
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '30%' },
        order: { xs: rank, sm: rank % 3 },
        marginBottom: { xs: '20px', sm: '0px' },
      }}
    >
      <div className={`${classes.rank} ${color}`}>{rank}位</div>
      <a className={classes.link} href={link} target="_blank" rel="noreferrer">
        <Image className={classes.image} src={image} width={128} height={186} />
        <div>{name}</div>
      </a>
    </Box>
  )
}
