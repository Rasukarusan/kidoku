import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { fetcher } from '@/libs/swr'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import useSWR from 'swr'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { Modal } from '@/components/layout/Modal'
import { ImagePicker } from '@/components/button/ImagePicker'
import { DangerAlert } from '@/components/label/DangerAlert'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { BookInputField } from '../BookInputField'
import { BookSelectBox } from '../BookSelectBox'
import { BookDatePicker } from '../BookDatePicker'
import { useRouter } from 'next/router'
import { BookCreatableSelectBox } from '../BookCreatableSelectBox'
import { SheetAddModal } from '@/features/sheet/components/SheetAddModal'
import { AiOutlineFileAdd } from 'react-icons/ai'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { openAddModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'
import { Label } from '../Label'
import { MaskingHint } from '@/components/label/MaskingHint'

import { GET_SHEETS } from '@/libs/apollo/queries'

interface Response {
  result: boolean
  bookTitle: string
  bookId: number
  sheetName: string
}

export const AddModal: React.FC = () => {
  const router = useRouter()
  const [open, setOpen] = useAtom(openAddModalAtom)
  const item = useAtomValue(addBookAtom)
  const { data: session } = useSession()
  const { data: sheetsData, refetch: refetchSheets } = useQuery(GET_SHEETS)
  const sheets = sheetsData?.sheets || []
  const { mutate } = useSWR(
    `/api/books/${router.asPath.split('/').pop()}`,
    fetcher
  )
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [response, setResponse] = useState<Response>(null)
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })
  const [sheet, setSheet] = useState<{ id: number; name: string }>({
    id: null,
    name: null,
  })
  const [openAdd, setOpenAdd] = useState(false)

  // カテゴリ一覧
  const { data: categories } = useSWR(`/api/books/category`, fetcher)
  const options =
    categories && categories.result
      ? categories.categories.map((category) => {
          return { value: category, label: category }
        })
      : []

  // シート取得次第、一番上のシートを選択状態にする
  useEffect(() => {
    if (sheets.length === 0) return
    setSheet({ id: sheets[0].id, name: sheets[0].name })
  }, [sheets])

  useEffect(() => {
    setResponse(null)
    if (!item) return
    const finished = dayjs().format('YYYY-MM-DD')
    setBook({
      ...item,
      is_public_memo: false,
      memo: item.memo ? item.memo : '[期待]\n\n[感想]\n',
      impression: '-',
      finished,
    })
  }, [item])

  const onClickAdd = async () => {
    if (!book) return
    setLoading(true)
    const res: Response = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({
        ...book,
        sheet,
      }),
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .catch((e) => {
        return {
          result: false,
          message: '本の登録に失敗しました。画像は3MBまで登録できます。',
        }
      })
    setResponse(res)
    if (res.result) {
      mutate()
      reward()
    }
    setLoading(false)
  }

  // アニメーションのカスタマイズ
  const modalVariants = {
    hidden: {
      y: '10vh',
      opacity: 0,
    },
    visible: {
      y: '0',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      y: '-100vh',
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  }
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-3/4 w-full overflow-y-auto bg-white sm:w-1/2">
        <Modal
          open={open}
          onClose={() => {
            setOpen(false)
          }}
          className="!z-[1200] h-3/4 w-full sm:w-1/2"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="bg-white p-4">
                    <div className="mb-2 flex items-center">
                      <ImagePicker
                        img={book?.image}
                        onImageLoad={(image) => {
                          setBook({ ...book, image })
                        }}
                      />
                      <div className="mr-2 w-2/3">
                        <BookInputField
                          value={book?.title}
                          onChange={(e) =>
                            setBook({ ...book, title: e.target.value })
                          }
                          label="タイトル"
                          tabIndex={1}
                        />
                        <BookInputField
                          value={book?.author}
                          onChange={(e) =>
                            setBook({ ...book, author: e.target.value })
                          }
                          label="著者"
                          tabIndex={2}
                        />
                        <BookCreatableSelectBox
                          label="カテゴリ"
                          defaultValue={{
                            value: book?.category,
                            label: book?.category,
                          }}
                          options={options}
                          tabIndex={3}
                          onChange={(newValue: {
                            value: string
                            label: string
                          }) => {
                            setBook({
                              ...book,
                              category: newValue?.value ?? '-',
                            })
                          }}
                        />
                        <div className="mt-2 flex items-center">
                          <div className="mr-4">
                            <BookSelectBox
                              value={book?.impression}
                              label="感想"
                              tabIndex={4}
                              onChange={(e) =>
                                setBook({ ...book, impression: e.target.value })
                              }
                            />
                          </div>
                          <BookDatePicker
                            value={dayjs(book?.finished).format('YYYY-MM-DD')}
                            label="読了日"
                            tabIndex={5}
                            onChange={(e) => {
                              setBook({
                                ...book,
                                finished: e.target.value
                                  ? dayjs(e.target.value).format('YYYY-MM-DD')
                                  : null,
                              })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <Label text="メモ" className="mb-0 mr-2" />
                        <MaskingHint />
                      </div>
                      <div className="text-xs text-gray-500">
                        {book?.memo?.length || 0} / 16,777,215 文字
                      </div>
                    </div>
                    <BookInputField
                      rows={8}
                      value={book?.memo}
                      onChange={(e) =>
                        setBook({ ...book, memo: e.target.value })
                      }
                      tabIndex={5}
                    />
                    <ToggleButton
                      label="メモを公開する"
                      checked={!!book?.is_public_memo}
                      onChange={() => {
                        setBook({
                          ...book,
                          is_public_memo: !book?.is_public_memo,
                        })
                      }}
                    />
                    <div className="w-full text-center text-gray-900 ">
                      <SheetAddModal
                        open={openAdd}
                        onClose={() => {
                          setOpenAdd(false)
                          refetchSheets()
                        }}
                      />
                      {sheets.length === 0 ? (
                        <button
                          className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-green-500 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-500"
                          onClick={() => {
                            setOpenAdd(true)
                          }}
                          disabled={!session}
                        >
                          <AiOutlineFileAdd className="mr-1 h-[24px] w-[24px] text-white" />
                          {session ? 'シートを追加' : 'ログインしてください'}
                        </button>
                      ) : (
                        <select
                          className="cursor-pointer border p-2 px-4"
                          onChange={(e) => {
                            const selectedOption = e.target.selectedOptions[0]
                            const sheetId =
                              selectedOption.getAttribute('data-id')
                            setSheet({
                              id: Number(sheetId),
                              name: e.target.value,
                            })
                          }}
                        >
                          {sheets.map((sheet) => {
                            const { id, name } = sheet
                            return (
                              <option key={name} value={name} data-id={id}>
                                {name}
                              </option>
                            )
                          })}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="border-1 w-full border-t text-center">
                    {response && (
                      <div className="absolute bottom-32 left-1/2 z-20 -translate-x-1/2 transform sm:bottom-28">
                        {response.result ? (
                          <SuccessAlert
                            open={!!response}
                            text={`『${response.bookTitle}』を「${response.sheetName}」に追加しました`}
                            onClose={() => {
                              setResponse(null)
                            }}
                          />
                        ) : (
                          <DangerAlert
                            open={!!response}
                            text="本の登録に失敗しました"
                            onClose={() => {
                              setResponse(null)
                            }}
                          />
                        )}
                      </div>
                    )}
                    {response?.bookId > 0 ? (
                      <button
                        className="flex h-12 w-full items-center justify-center rounded-b-md bg-green-600 px-4 py-1 font-bold text-white hover:bg-green-700 disabled:bg-blue-700"
                        onClick={() => {
                          setOpen(false)
                          router.push(
                            `/${session.user.name}/sheets/${response.sheetName}?book=${response.bookId}`
                          )
                        }}
                      >
                        <span id="rewardId">シートに飛ぶ</span>
                      </button>
                    ) : (
                      <button
                        className="flex h-12 w-full items-center justify-center rounded-b-md bg-blue-600 px-4 py-1 font-bold text-white hover:bg-blue-700 disabled:bg-gray-500"
                        onClick={onClickAdd}
                        tabIndex={6}
                        disabled={isAnimating || !session}
                      >
                        {loading && (
                          <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
                        )}
                        <span id="rewardId">
                          {session ? '本を登録する' : 'ログインしてください'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>
    </div>
  )
}
