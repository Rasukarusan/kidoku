import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export const AddButton: React.FC = () => {
  const [hover, setHover] = useState(false)
  const onClick = async () => {
    const body = {
      year: 2022,
      title: 'hogeeee',
      author: '著者',
      category: '小説',
      image: 'https://imageurl',
      memo: '[期待]\nきたい\n\n[感想]\nかんそう',
    }
    const res = await fetch('/api/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((json) => json)
    console.log(res)
  }
  return (
    <Grid item xs={4} sm={3} md={2}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
        whileHover={{
          background: 'rgba(0, 0, 0, 0.2)',
        }}
        style={{
          cursor: 'pointer',
          background: 'rgba(0, 0, 0, 0.1)',
          width: 128,
          height: 186,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{ textAlign: 'center' }}>
          <IconButton color="primary" aria-label="add book" component="label">
            <AddIcon />
          </IconButton>
          <div
            style={{
              fontSize: '12px',
              visibility: hover ? 'visible' : 'hidden',
            }}
          >
            本を追加
          </div>
        </div>
      </motion.div>
    </Grid>
  )
}
