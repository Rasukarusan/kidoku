import useSWR from 'swr'
import axios from 'axios'
import { Container } from '@material-ui/core'
import { H2 } from '@/components/Label/H2'

const fetcher = (url) => axios.get(url).then((res) => res.data)

export const SheetPage = () => {
  const { data, error } = useSWR(
    `https://script.google.com/macros/s/AKfycbz8OBp3KeE9cY4ZEi0qK18tL2maoTSjwm86SRXjaywGs-8X-84sef_Db01jFQ9JUzWw/exec?year=2022`,
    fetcher
  )
  console.log(data)
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  return (
    <Container fixed>
      <H2 title="読書シート" />
      {Object.keys(data).map((key) => (
        <div key={key}>
          <div>
            <b>{key}</b>
          </div>
          {data[key].map((book) => {
            return (
              <div key={book.title}>
                {book.title},{book.author}
              </div>
            )
          })}
        </div>
      ))}
    </Container>
  )
}
