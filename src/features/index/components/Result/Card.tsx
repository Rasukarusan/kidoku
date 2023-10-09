import React from 'react'
import { makeStyles, createStyles } from '@mui/styles'
import {
  Tooltip,
  Checkbox,
  Card as MuiCard,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material'
import {
  CheckCircleOutline as CircleChecked,
  RadioButtonUnchecked as CircleUnchecked,
} from '@mui/icons-material'
import { Item } from '@/types/search'
import { truncate } from '../../util'
import { theme as Theme } from '@/features/global/theme'
import { selectItemsAtom } from '@/store/selectItems'
import { useRecoilState } from 'recoil'
import { NO_IMAGE } from '@/libs/constants'

const useStyles = makeStyles((theme: typeof Theme) =>
  createStyles({
    root: {
      width: 200,
      height: 300,
      cursor: 'pointer',
    },
    title: {
      color: theme.palette.primary.main,
      whiteSpace: 'nowrap',
    },
    subheader: {
      color: theme.palette.primary.light,
    },
    media: {
      height: 150,
      objectFit: 'contain',
    },
  })
)
export interface Props {
  row: number
  searchWord: string
  item: Item
}

export const Card: React.FC<Props> = ({ row, searchWord, item }) => {
  const classes = useStyles()
  const { title, description, authors, imageLinks } = item.volumeInfo
  const [selectItems, setSelectItems] = useRecoilState(selectItemsAtom)
  const onClick = () => {
    const newSelectItems = [...selectItems]
    newSelectItems[row] = item
    setSelectItems(newSelectItems)
  }
  const isCheck = selectItems[row]?.id === item.id
  return (
    <MuiCard
      className={classes.root}
      onClick={onClick}
      sx={{
        background: isCheck ? 'rgba(245, 88, 194, 0.2)' : '',
      }}
    >
      <Tooltip title={title}>
        <div>
          <CardHeader
            avatar={
              <Checkbox
                icon={<CircleUnchecked />}
                checkedIcon={<CircleChecked />}
                checked={isCheck}
              />
            }
            subheader={Array.isArray(authors) ? authors.join(',') : '-'}
            title={title}
            classes={{ title: classes.title, subheader: classes.subheader }}
          />
        </div>
      </Tooltip>
      <CardMedia
        component="img"
        className={classes.media}
        image={imageLinks ? imageLinks.thumbnail : NO_IMAGE}
        title={title}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {truncate(description, 30)}
        </Typography>
      </CardContent>
    </MuiCard>
  )
}
