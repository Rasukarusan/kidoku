import { useEffect, useRef, useState } from 'react'
import { Modal } from '../layout/Modal'
import { FaLink } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'

interface Props {
  img?: string
  onImageLoad?: (image: string) => void
}
export const ImagePicker: React.FC<Props> = ({ onImageLoad, img }) => {
  const ref = useRef(null)
  const [image, setImage] = useState(img)
  const [base64, setBase64] = useState('')
  const [open, setOpen] = useState(false)

  // URLから画像を読み込む
  const loadImageAsBase64 = (url): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL()
        // Base64部分のみを返す
        const base64Image = dataURL.split(',')[1]
        setBase64(base64Image)
        setImage(dataURL)
      }
      img.onerror = reject
      img.crossOrigin = 'Anonymous' // CORSポリシー回避
      img.src = url
    })
  }

  // ファイルから画像選択
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImage(url)
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Image = (e.target.result as string).split(',')[1]
      setBase64(base64Image)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (e) => {
    onImageLoad && onImageLoad(base64)
    setOpen(false)
  }

  useEffect(() => {
    setImage(img)
  }, [img])

  return (
    <>
      <button
        className="relative mr-4 w-1/3 hover:brightness-90"
        onClick={() => setOpen(true)}
      >
        <img className="mx-auto my-0 drop-shadow-lg" src={image} alt="" />
        <input
          ref={ref}
          type="file"
          onChange={handleChange}
          className="hidden"
        />
        <div className="absolute top-1/2 mx-auto flex h-full w-full -translate-y-1/2 transform items-center justify-center opacity-0  hover:opacity-100">
          <MdEdit size={30} className="rounded-full bg-black p-1 text-white" />
        </div>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="w-full sm:w-[500px]"
      >
        <div className="mx-auto w-full rounded-md bg-white p-4 text-center sm:w-10/12">
          <div className="mb-4 flex items-center justify-start rounded-md border-2 border-slate-300 px-2 py-2">
            <FaLink className="mr-2 text-slate-500" />
            <input
              type="text"
              onChange={async (e) => {
                await loadImageAsBase64(e.target.value)
              }}
              placeholder="画像URLをペースト"
              className="w-full placeholder:text-sm focus:outline-none"
            />
          </div>
          <button
            className="mb-4 hover:brightness-75"
            onClick={() => ref.current.click()}
          >
            <img
              className="mx-auto my-0 max-h-52 drop-shadow-lg"
              src={image}
              alt=""
            />
            <input
              ref={ref}
              type="file"
              onChange={handleChange}
              className="hidden"
            />
          </button>
          <button
            className="mx-auto block rounded-md bg-green-700 px-4 py-1 text-sm text-white"
            onClick={onSubmit}
          >
            決定
          </button>
        </div>
      </Modal>
    </>
  )
}
