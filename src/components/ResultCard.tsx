import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import {
  Tooltip,
  Checkbox,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

import {
  CheckCircleOutline as CircleChecked,
  RadioButtonUnchecked as CircleUnchecked,
} from '@material-ui/icons'

const useStyles = makeStyles((theme: Theme) =>
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
  selectList: SelectList
  updateSelectList: (newSelectList: SelectList) => void
  searchWord: string
  title: string
  description?: string
  imageUrl: string
  authors?: string[]
  categories?: string[]
}

export interface SelectList {
  [key: string]: { title: string; authors: string[]; categories: string[] }
}

export const ResultCard: React.FC<Props> = ({
  selectList,
  updateSelectList,
  searchWord,
  title,
  description,
  imageUrl,
  authors,
  categories,
}) => {
  const classes = useStyles()
  const truncate = (str: string, len: number) => {
    if (!str) return '-'
    return str.length <= len ? str : str.substr(0, len) + '...'
  }

  return (
    <Card
      className={classes.root}
      onClick={() =>
        updateSelectList({
          ...selectList,
          [searchWord]: { title, authors, categories },
        })
      }
    >
      <Tooltip title={title}>
        <div>
          <CardHeader
            avatar={
              <Checkbox
                icon={<CircleUnchecked />}
                checkedIcon={<CircleChecked />}
                checked={selectList[searchWord].title === title}
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
        image={imageUrl}
        title={title}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {truncate(description, 30)}
        </Typography>
      </CardContent>
    </Card>
  )
}
