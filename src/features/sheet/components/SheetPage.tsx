import { Container } from '@mui/material'
import { H2 } from '@/components/Label/H2'
import { ReadingRecord } from '../types'

interface Props {
  data: ReadingRecord
}
export const SheetPage: React.FC<Props> = ({ data }) => {
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
