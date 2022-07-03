import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import {
  Tooltip,
  Checkbox,
  Card as MuiCard,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
} from '@material-ui/core'
import {
  CheckCircleOutline as CircleChecked,
  RadioButtonUnchecked as CircleUnchecked,
} from '@material-ui/icons'
import { CopyList, VolumeInfo } from '../../types'

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
  copyList: CopyList
  updateCopyList: (newCopyList: CopyList) => void
  searchWord: string
  volumeInfo: VolumeInfo
}

export const Card: React.FC<Props> = ({
  copyList,
  updateCopyList,
  searchWord,
  volumeInfo,
}) => {
  const classes = useStyles()
  const { title, description, authors, categories, imageLinks } = volumeInfo
  const truncate = (str: string, len: number) => {
    if (!str) return '-'
    return str.length <= len ? str : str.substr(0, len) + '...'
  }

  return (
    <MuiCard
      className={classes.root}
      onClick={() =>
        updateCopyList({
          ...copyList,
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
                checked={copyList[searchWord].title === title}
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
        image={imageLinks ? imageLinks.thumbnail : '/no-image.png'}
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
