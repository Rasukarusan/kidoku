import { useState } from 'react'
import { fetcher } from '@/libs/swr'
import { TemplateAddModal } from './TemplateAddModal'
import useSWR from 'swr'

interface Props {
  input: string
  onClose: () => void
}

export const Template: React.FC<Props> = ({ input, onClose }) => {
  const [open, setOpen] = useState(false)
  const { data } = useSWR('/api/template/books', fetcher)
  console.log(data)
  return (
    <>
      <div className="p-8">
        <div className="flex justify-start">
          {data?.templates.map((template) => (
            <div key={template.id}>
              <button
                className="m-2 h-[140px] w-[96px] rounded-md text-2xl shadow-md hover:brightness-95 sm:h-[156px] sm:w-[108px]"
                onClick={() => {
                  setOpen(true)
                }}
              >
                <img src={template.image} alt="" />
              </button>
              <div>{template.name}</div>
            </div>
          ))}
          <button
            className="m-2 h-[140px] w-[96px] rounded-md bg-gray-100 text-2xl shadow-md hover:brightness-95 sm:h-[156px] sm:w-[108px]"
            onClick={() => {
              setOpen(true)
            }}
          >
            <span className="font-bold">+</span>
          </button>
        </div>
      </div>
      <TemplateAddModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
