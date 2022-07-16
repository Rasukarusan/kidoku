import React from 'react'
import { makeStyles, createStyles } from '@mui/styles'
import {
  Tooltip,
  Card as MuiCard,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material'

import { theme as Theme } from '@/features/global/theme'
import { Record } from '../types'

const useStyles = makeStyles((theme: typeof Theme) =>
  createStyles({
    root: {
      width: 200,
      height: 300,
      cursor: 'pointer',
      boxShadow: `3px 3px 3px ${theme.palette.secondary.main};`,
      margin: 5,
    },
    title: {
      fontSize: '16px',
      color: theme.palette.primary.main,
      whiteSpace: 'nowrap',
    },
    subheader: {
      fontSize: '14px',
      color: theme.palette.primary.light,
    },
    media: {
      height: 150,
      objectFit: 'contain',
    },
  })
)
export interface Props {
  record: Record
}

export const Card: React.FC<Props> = ({ record }) => {
  const classes = useStyles()
  const { title, author, category, image, impression, memo } = record
  console.log(record)
  console.log(image)
  return (
    <MuiCard className={classes.root}>
      <Tooltip title={title}>
        <div>
          <CardHeader
            title={title}
            subheader={author}
            classes={{ title: classes.title, subheader: classes.subheader }}
          />
        </div>
      </Tooltip>
      <CardMedia
        component="img"
        className={classes.media}
        image={!image ? '/no-image.png' : image}
        title={title}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {impression}
        </Typography>
      </CardContent>
    </MuiCard>
  )
}
