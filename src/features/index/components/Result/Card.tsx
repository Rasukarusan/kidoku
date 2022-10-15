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
import { VolumeInfo } from '../../types'
import { truncate } from '../../util'
import { theme as Theme } from '@/features/global/theme'
import { copyListAtom } from '@/store/copyList'
import { useRecoilState } from 'recoil'

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
  isChecked: boolean
  searchWord: string
  volumeInfo: VolumeInfo
}

export const Card: React.FC<Props> = ({
  isChecked,
  searchWord,
  volumeInfo,
}) => {
  const classes = useStyles()
  const { title, description, authors, categories, imageLinks } = volumeInfo
  const [copyList, setCopyList] = useRecoilState(copyListAtom)
  const onClick = () => {
    setCopyList({
      ...copyList,
      [searchWord]: {
        title,
        authors,
        categories,
        imageLink: imageLinks ? imageLinks.thumbnail : '/no-image.png',
      },
    })
  }
  return (
    <MuiCard className={classes.root} onClick={onClick}>
      <Tooltip title={title}>
        <div>
          <CardHeader
            avatar={
              <Checkbox
                icon={<CircleUnchecked />}
                checkedIcon={<CircleChecked />}
                checked={isChecked}
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
