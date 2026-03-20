import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import { useApolloClient, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import { Modal } from '@/components/layout/Modal'
import { ImagePicker } from '@/components/button/ImagePicker'
import { DangerAlert } from '@/components/label/DangerAlert'
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

import { getSheetsQuery } from '@/features/sheet/api'
import { getBookCategoriesQuery } from '@/features/books/api'

// SSRを無効にしてクライアントサイドのみでロード
const MarkdownEditor = dynamic(
  () =>
    import('@/components/input/MarkdownEditor').then(
      (mod) => mod.MarkdownEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <span className="text-gray-400">エディタを読み込み中...</span>
      </div>
    ),
  }
)

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
  const apolloClient = useApolloClient()
  const { data: sheetsData, refetch: refetchSheets } = useQuery(
    getSheetsQuery,
    {
      skip: !session,
    }
  )
  const sheets = sheetsData?.sheets || []
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [response, setResponse] = useState<Response>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 400,
    spread: 80,
    startVelocity: 45,
    decay: 0.9,
    lifetime: 250,
  })
  const [sheet, setSheet] = useState<{ id: number; name: string }>({
    id: null,
    name: null,
  })
  const [openAdd, setOpenAdd] = useState(false)

  // カテゴリ一覧（GraphQL）
  const { data: categoriesData } = useQuery<{ bookCategories: string[] }>(
    getBookCategoriesQuery,
    { skip: !session }
  )
  const options = categoriesData
    ? categoriesData.bookCategories.map((category) => ({
        value: category,
        label: category,
      }))
    : []

  // シート取得次第、一番上のシートを選択状態にする
  useEffect(() => {
    if (sheets.length === 0) return
    setSheet({ id: sheets[0].id, name: sheets[0].name })
  }, [sheets])

  useEffect(() => {
    setResponse(null)
    setShowSuccess(false)
    if (!item) return
    const finished = dayjs().format('YYYY-MM-DD')
    setBook({
      ...item,
      isPublicMemo: false,
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
      .catch(() => {
        return {
          result: false,
          message: '本の登録に失敗しました。画像は3MBまで登録できます。',
        }
      })
    setResponse(res)
    if (res.result) {
      apolloClient.refetchQueries({ include: ['GetBooks'] })
      setShowSuccess(true)
      // 紙吹雪はDOM切り替え後に発火させる
      setTimeout(() => {
        reward()
      }, 400)
    }
    setLoading(false)
  }

  const handleClose = () => {
    setOpen(false)
    // モーダルが閉じた後に成功状態をリセット
    setTimeout(() => {
      setShowSuccess(false)
      setResponse(null)
    }, 300)
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
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      y: '-100vh',
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const,
      },
    },
  }
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="!z-[1200] h-3/4 w-full sm:w-3/4 lg:w-1/2"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <AnimatePresence mode="wait">
              {showSuccess && response?.result ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex min-h-[400px] flex-col items-center justify-between"
                >
                  <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
                    {/* 本の表紙 */}
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 0.1,
                      }}
                      className="mb-6"
                    >
                      {book?.image ? (
                        <img
                          src={book.image}
                          alt={response.bookTitle}
                          className="h-48 w-auto rounded-lg object-contain shadow-xl"
                        />
                      ) : (
                        <div className="flex h-48 w-32 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shadow-xl">
                          <span className="px-2 text-center text-sm font-bold text-blue-600">
                            {response.bookTitle}
                          </span>
                        </div>
                      )}
                    </motion.div>

                    {/* チェックマークアイコン */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 0.3,
                      }}
                      className="mb-4"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                        <svg
                          className="h-8 w-8 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    {/* メッセージ */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="text-center"
                    >
                      <h3 className="mb-2 text-xl font-bold text-gray-800">
                        登録しました!
                      </h3>
                      <p className="text-sm text-gray-500">
                        『{response.bookTitle}』を
                        <br />「{response.sheetName}」に追加しました
                      </p>
                    </motion.div>
                  </div>

                  {/* アクションボタン */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className="flex w-full border-t"
                  >
                    <button
                      className="flex h-12 flex-1 items-center justify-center border-r text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
                      onClick={handleClose}
                    >
                      閉じる
                    </button>
                    <button
                      className="flex h-12 flex-1 items-center justify-center rounded-br-md bg-green-600 text-sm font-bold text-white transition-colors hover:bg-green-700"
                      onClick={() => {
                        setOpen(false)
                        router.push(
                          `/${session.user.name}/sheets/${response.sheetName}`
                        )
                      }}
                    >
                      <span id="rewardId">シートを見る</span>
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                                  setBook({
                                    ...book,
                                    impression: e.target.value,
                                  })
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
                          {book?.memo?.length || 0} 文字
                        </div>
                      </div>
                      <MarkdownEditor
                        value={book?.memo || ''}
                        onChange={(memo) => setBook({ ...book, memo })}
                        minHeight="200px"
                      />
                      <ToggleButton
                        label="メモを公開する"
                        checked={!!book?.isPublicMemo}
                        onChange={() => {
                          setBook({
                            ...book,
                            isPublicMemo: !book?.isPublicMemo,
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
                      {response && !response.result && (
                        <div className="absolute bottom-32 left-1/2 z-20 -translate-x-1/2 transform sm:bottom-28">
                          <DangerAlert
                            open={!!response}
                            text="本の登録に失敗しました"
                            onClose={() => {
                              setResponse(null)
                            }}
                          />
                        </div>
                      )}
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
