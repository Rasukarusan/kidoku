import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { fetcher } from '@/libs/swr'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import useSWR from 'swr'
import { Modal } from '@/components/layout/Modal'
import { ImagePicker } from '@/components/button/ImagePicker'
import { DangerAlert } from '@/components/label/DangerAlert'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { BookInputField } from '../BookInputField'
import { BookCreatableSelectBox } from '../BookCreatableSelectBox'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { NO_IMAGE } from '@/libs/constants'

interface Response {
  result: boolean
}

interface Props {
  open: boolean
  onClose: () => void
}

export const TemplateAddModal: React.FC<Props> = ({ open, onClose }) => {
  const { data: session } = useSession()
  const { mutate } = useSWR('/api/template/books', fetcher)
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState(null)
  const [response, setResponse] = useState<Response>(null)
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })

  // カテゴリ一覧
  const { data: categories } = useSWR(`/api/books/category`, fetcher)
  const options =
    categories && categories.result
      ? categories.categories.map((category) => {
          return { value: category, label: category }
        })
      : []

  useEffect(() => {
    setResponse(null)
  }, [])

  const onClickAdd = async () => {
    const initialTemplate = {
      name: 'テンプレート1',
      title: '',
      author: '',
      image: NO_IMAGE,
      category: '',
      is_public_memo: false,
      memo: '',
    }
    setLoading(true)
    const res: Response = await fetch(`/api/template/books`, {
      method: 'POST',
      body: JSON.stringify({
        ...initialTemplate,
        ...template,
      }),
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .catch(() => {
        return {
          result: false,
          message:
            'テンプレートの登録に失敗しました。画像は3MBまで登録できます。',
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
    <Modal
      open={open}
      onClose={onClose}
      className="!z-[1200] h-3/4 w-full sm:w-1/2"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="p-2 text-center">
            <input
              placeholder="テンプレート1"
              className="h-10 border-b border-slate-400 px-2 py-1 text-lg focus:outline-none"
              onChange={(e) => {
                const name = e.target.value
                setTemplate({ ...template, name })
              }}
            />
          </div>
          <div className="bg-white p-4">
            <div className="flex items-center">
              <ImagePicker
                img={template?.image ?? NO_IMAGE}
                onImageLoad={(image) => {
                  setTemplate({ ...template, image })
                }}
              />
              <div className="mr-2 w-2/3">
                <BookInputField
                  value={template?.title}
                  onChange={(e) =>
                    setTemplate({ ...template, title: e.target.value })
                  }
                  label="タイトル"
                  tabIndex={1}
                />
                <BookInputField
                  value={template?.author}
                  onChange={(e) =>
                    setTemplate({ ...template, author: e.target.value })
                  }
                  label="著者"
                  tabIndex={2}
                />
                <BookCreatableSelectBox
                  label="カテゴリ"
                  defaultValue={{
                    value: template?.category,
                    label: template?.category,
                  }}
                  options={options}
                  tabIndex={3}
                  onChange={(newValue: { value: string; label: string }) => {
                    setTemplate({
                      ...template,
                      category: newValue?.value ?? '-',
                    })
                  }}
                />
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">メモ</label>
              <div className="text-xs text-gray-500">
                {template?.memo?.length || 0} / 16,777,215 文字
              </div>
            </div>
            <BookInputField
              rows={8}
              value={template?.memo}
              onChange={(e) =>
                setTemplate({ ...template, memo: e.target.value })
              }
              tabIndex={5}
            />
            <ToggleButton
              label="メモを公開する"
              checked={!!template?.is_public_memo}
              onChange={() => {
                setTemplate({
                  ...template,
                  is_public_memo: !template?.is_public_memo,
                })
              }}
            />
          </div>
          <div className="border-1 w-full border-t text-center">
            {response && (
              <div className="absolute bottom-32 left-1/2 z-20 -translate-x-1/2 transform sm:bottom-28">
                {response.result ? (
                  <SuccessAlert
                    open={!!response}
                    text="テンプレートを登録しました"
                    onClose={() => {
                      setResponse(null)
                    }}
                  />
                ) : (
                  <DangerAlert
                    open={!!response}
                    text="テンプレートの登録に失敗しました"
                    onClose={() => {
                      setResponse(null)
                    }}
                  />
                )}
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
                {session ? 'テンプレートを登録' : 'ログインしてください'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}
