import { useState } from 'react'
import { TemplateAddModal } from './TemplateAddModal'
import { ManualRegisterButton } from './ManualRegisterButton'
import { FaRegTrashAlt } from 'react-icons/fa'
import { Loading } from '@/components/icon/Loading'
import { useMutation, useQuery } from '@apollo/client'
import { useSession } from 'next-auth/react'
import {
  templateBooksQuery,
  deleteTemplateBookMutation,
} from '@/features/template/api'
import { SearchResult } from '@/types/search'

interface Props {
  input: string
  onClose: () => void
  onSelectBook: (book: SearchResult) => void
}

export const Template: React.FC<Props> = ({ onSelectBook }) => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [hoverTemplate, setHoverTemplate] = useState(null)
  const { data, loading, refetch } = useQuery(templateBooksQuery, {
    skip: !session,
  })
  const [deleteTemplateBook] = useMutation(deleteTemplateBookMutation, {
    refetchQueries: [{ query: templateBooksQuery }],
  })

  return (
    <>
      <TemplateAddModal
        open={open}
        onClose={() => {
          setOpen(false)
        }}
        onCreated={() => refetch()}
      />
      <div className="p-4 sm:p-8">
        <ManualRegisterButton onSelectBook={onSelectBook} />
        <div className="mt-3 text-center">
          <button
            type="button"
            className="rounded px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            onClick={() => setOpen(true)}
          >
            テンプレートを作成
          </button>
        </div>
        {loading && (
          <Loading className="mx-auto mt-8 h-[18px] w-[18px] border-[3px]" />
        )}
        {!!data?.templateBooks?.length && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium text-gray-700">
              保存済みのテンプレート
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data?.templateBooks?.map((template) => (
                <div key={template.id} className="relative mx-auto">
                  <button
                    className="absolute right-0 top-0 z-10 bg-white"
                    onClick={async () => {
                      const yes = confirm(`${template.name}を削除しますか?`)
                      if (!yes) return
                      try {
                        await deleteTemplateBook({
                          variables: { input: { id: Number(template.id) } },
                        })
                        alert('削除しました')
                      } catch {
                        alert('削除に失敗しました')
                      }
                    }}
                  >
                    {hoverTemplate?.id === template.id && <FaRegTrashAlt />}
                  </button>
                  <button
                    onMouseEnter={() => setHoverTemplate(template)}
                    className="m-2 h-[140px] w-[96px] rounded-md text-2xl shadow-md hover:brightness-95 sm:h-[156px] sm:w-[108px]"
                    onClick={() => {
                      const { id, title, memo, author, category, image } =
                        template
                      onSelectBook({
                        id,
                        title,
                        author,
                        image,
                        category,
                        memo,
                      })
                    }}
                  >
                    <img src={template.image} alt="" />
                  </button>
                  <div className="truncate text-center text-sm">
                    {template.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
