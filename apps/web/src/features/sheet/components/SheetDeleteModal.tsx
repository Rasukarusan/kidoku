import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'
import { Loading } from '@/components/icon/Loading'
import { useMutation } from '@apollo/client'
import { DELETE_SHEET } from '@/libs/apollo/queries'

interface Props {
  sheet: string
  open: boolean
  onClose: () => void
  username: string
}

export const SheetDeleteModal: React.FC<Props> = ({
  sheet,
  open,
  onClose,
  username,
}) => {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const [deleteSheet, { loading }] = useMutation(DELETE_SHEET)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  return (
    <Modal
      open={open}
      onClose={() => {
        setInput('')
        onClose()
      }}
      className="h-[250px] w-[500px]"
    >
      <div className="p-4 text-center sm:p-10">
        <div className="mb-2 text-2xl font-bold">シートを削除</div>
        <div className="mb-2 text-sm text-gray-500">
          シートを削除すると紐づいている本も全て削除されます。削除されたシート、本は復元できませんのでご注意ください。
        </div>
        <input
          ref={ref}
          className="mx-auto mb-2 block w-2/3 rounded-md border p-2"
          type="text"
          onChange={(e) => {
            setInput(e.target.value)
          }}
          value={input}
        />
        <div className="mb-2 text-sm text-gray-500">
          削除するには「<span className="font-bold text-gray-700">{sheet}</span>
          」と入力してください
        </div>
        <button
          className="mx-auto flex items-center justify-center rounded-md bg-red-700 px-4 py-1 font-bold text-white disabled:bg-gray-300"
          disabled={input !== sheet || loading}
          onClick={async () => {
            try {
              await deleteSheet({
                variables: {
                  input: {
                    name: input,
                  },
                },
              })
              alert('削除しました')
              location.href = `${process.env.NEXT_PUBLIC_HOST}/${username}/sheets/total`
            } catch (error) {
              alert('シートの削除に失敗しました')
            }
          }}
        >
          {loading ? (
            <>
              <Loading className="mr-2 h-[20px] w-[20px] border-white text-white" />
              <span>削除中...</span>
            </>
          ) : (
            <span>削除する</span>
          )}
        </button>
      </div>
    </Modal>
  )
}
