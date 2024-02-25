import { useEffect, useState } from 'react'
import { kosugi, notojp } from '@/libs/fonts'
import { AddModal } from '@/components/input/SearchBox/AddModal'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState(null)
  useEffect(() => {
    setInterval(() => {
      fetch('/api/barcode')
        .then((res) => res.json())
        .then((res) => {
          if (res.result && res.book) {
            setBook(res.book)
            setOpen(true)
          }
        })
    }, 1000)
  }, [])
  return (
    <div className={`${kosugi.variable} ${notojp.variable}`}>
      <AddModal
        open={open}
        item={book}
        onClose={() => {
          setOpen(false)
        }}
      />
      {children}
    </div>
  )
}
