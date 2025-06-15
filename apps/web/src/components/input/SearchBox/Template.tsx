import { useState } from 'react'
import { fetcher } from '@/libs/swr'
import { TemplateAddModal } from './TemplateAddModal'
import useSWR from 'swr'
import { useSetAtom } from 'jotai'
import { openAddModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'
import { FaRegTrashAlt } from 'react-icons/fa'
import { Loading } from '@/components/icon/Loading'
import { TemplatesResponse } from '@/types/api'

interface Props {
  input: string
  onClose: () => void
}

export const Template: React.FC<Props> = () => {
  const [open, setOpen] = useState(false)
  const [hoverTemplate, setHoverTemplate] = useState(null)
  const { data, mutate } = useSWR<TemplatesResponse>('/api/template/books', fetcher)
  const setOpenAddModal = useSetAtom(openAddModalAtom)
  const setSelectItem = useSetAtom(addBookAtom)

  return (
    <>
      <TemplateAddModal
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      />
      <div className="p-8">
        {!data && <Loading className="mr-2 h-[18px] w-[18px] border-[3px]" />}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {data?.templates?.map((template) => (
            <div key={template.id} className="relative mx-auto">
              <button
                className="absolute right-0 top-0 z-10 bg-white"
                onClick={async () => {
                  const yes = confirm(`${template.name}を削除しますか?`)
                  if (!yes) return
                  const res = await fetch(`/api/template/books`, {
                    method: 'DELETE',
                    body: JSON.stringify({
                      id: template.id,
                    }),
                    headers: {
                      Accept: 'application/json',
                    },
                  }).then((res) => res.json())
                  mutate()
                  alert(res.result ? '削除しました' : '削除に失敗しました')
                }}
              >
                {hoverTemplate?.id === template.id && <FaRegTrashAlt />}
              </button>
              <button
                onMouseEnter={() => setHoverTemplate(template)}
                className="m-2 h-[140px] w-[96px] rounded-md text-2xl shadow-md hover:brightness-95 sm:h-[156px] sm:w-[108px]"
                onClick={() => {
                  const { id, title, memo, author, category, image } = template
                  setSelectItem({
                    id,
                    title,
                    author,
                    image,
                    category,
                    memo,
                  })
                  setOpenAddModal(true)
                }}
              >
                <img src={template.image} alt="" />
              </button>
              <div className="truncate text-center text-sm">
                {template.name}
              </div>
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
    </>
  )
}
