import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export const AddButton: React.FC = () => {
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
    <div style={{ textAlign: 'right', paddingTop: '10px' }}>
      <Button variant="contained" color="primary" endIcon={<AddIcon />}>
        シートに追加
      </Button>
    </div>
  )
}
