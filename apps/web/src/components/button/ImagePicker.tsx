import { useEffect, useRef, useState } from 'react'
import { Modal } from '../layout/Modal'
import { FaLink } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { useImageUpload } from '@/hooks/useImageUpload'

interface Props {
  img?: string
  onImageLoad?: (image: string) => void
}
export const ImagePicker: React.FC<Props> = ({ onImageLoad, img }) => {
  const ref = useRef(null)
  const [image, setImage] = useState(img)
  const [previewUrl, setPreviewUrl] = useState(img)
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const { uploadImage, uploading, error } = useImageUpload()

  // URLから画像を読み込む
  const loadImageFromUrl = (url: string) => {
    // URLが有効かチェック
    if (url.startsWith('http')) {
      setImage(url)
      setPreviewUrl(url)
      setUrlInput(url)
    }
  }

  // ファイルから画像選択
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // プレビュー用のURL生成
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
  }

  const onSubmit = async () => {
    try {
      let finalUrl = image

      // ファイルが選択されている場合はアップロード
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile)
        if (uploadedUrl) {
          finalUrl = uploadedUrl
        } else {
          // アップロード失敗
          return
        }
      }
      // URLが入力されている場合
      else if (urlInput && urlInput !== image) {
        finalUrl = urlInput
      }

      onImageLoad && onImageLoad(finalUrl)
      setImage(finalUrl)
      setOpen(false)
      setSelectedFile(null)
      setUrlInput('')
    } catch (err) {
      console.error('Image upload failed:', err)
    }
  }

  useEffect(() => {
    setImage(img)
    setPreviewUrl(img)
  }, [img])

  return (
    <>
      <button
        className="relative mr-4 w-1/3 hover:brightness-90"
        onClick={() => setOpen(true)}
      >
        <img className="mx-auto my-0 drop-shadow-lg" src={previewUrl} alt="" />
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <div className="absolute top-1/2 mx-auto flex h-full w-full -translate-y-1/2 transform items-center justify-center opacity-0  hover:opacity-100">
          <MdEdit size={30} className="rounded-full bg-black p-1 text-white" />
        </div>
      </button>
      <Modal
        open={open}
        onClose={() => {
          // 初期画像に戻す
          setImage(img)
          setPreviewUrl(img)
          setSelectedFile(null)
          setUrlInput('')
          setOpen(false)
        }}
        className="w-full sm:w-[500px]"
      >
        <div className="mx-auto w-full rounded-md bg-white p-4 text-center sm:w-10/12">
          <div className="mb-4 flex items-center justify-start rounded-md border-2 border-slate-300 px-2 py-2">
            <FaLink className="mr-2 text-slate-500" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                loadImageFromUrl(e.target.value)
              }}
              placeholder="画像URLをペースト"
              className="w-full placeholder:text-sm focus:outline-none"
            />
          </div>
          <button
            className="mb-4 hover:brightness-75"
            onClick={() => ref.current.click()}
            disabled={uploading}
          >
            <img
              className="mx-auto my-0 max-h-52 drop-shadow-lg"
              src={previewUrl}
              alt=""
            />
            <input
              ref={ref}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </button>
          {error && (
            <p className="mb-2 text-sm text-red-600">
              アップロードエラー: {error}
            </p>
          )}
          {uploading && (
            <p className="mb-2 text-sm text-gray-600">アップロード中...</p>
          )}
          <button
            className="mx-auto block rounded-md bg-green-700 px-4 py-1 text-sm text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={uploading}
          >
            決定
          </button>
        </div>
      </Modal>
    </>
  )
}
