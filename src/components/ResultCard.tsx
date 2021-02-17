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
    header: {
      // cursor: 'pointer',
    },
    media: {
      height: 150,
      objectFit: 'contain',
    },
  })
)
export interface Props {
  title: string
  description?: string
  imageUrl: string
  authors?: string[]
}

export const ResultCard: React.FC<Props> = ({
  title,
  description,
  imageUrl,
  authors,
}) => {
  const classes = useStyles()
  const [check, setCheck] = React.useState(false)

  const handleOnClick = () => {
    setCheck(!check)
  }

  const truncate = (str: string, len: number) => {
    if (!str) return 'no description'
    return str.length <= len ? str : str.substr(0, len) + '...'
  }

  return (
    <Card className={classes.root} onClick={handleOnClick}>
      <Tooltip title={title}>
        <CardHeader
          avatar={
            <Checkbox
              icon={<CircleUnchecked />}
              checkedIcon={<CircleChecked />}
              checked={check}
            />
          }
          title={title}
          subheader={Array.isArray(authors) ? authors.join(',') : '-'}
          className={classes.header}
          classes={{ title: classes.title, subheader: classes.subheader }}
        />
      </Tooltip>
      <CardMedia
        component="img"
        className={classes.media}
        image={imageUrl}
        title={title}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {truncate(description, 40)}
        </Typography>
      </CardContent>
    </Card>
  )
}
