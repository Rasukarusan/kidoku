import { useRef, useState } from 'react'

interface Props {
  img?: string
  onImageLoad?: (image: string) => void
}
export const ImagePicker: React.FC<Props> = ({ onImageLoad, img }) => {
  const ref = useRef(null)
  const [image, setImage] = useState(img)

  // 画像選択
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImage(url)
    const reader = new FileReader()
    reader.onload = (e) => {
      const image = (e.target.result as string).split(',')[1]
      onImageLoad && onImageLoad(image)
    }
    reader.readAsDataURL(file)
  }

  return (
    <button className="w-1/3 mr-4" onClick={() => ref.current.click()}>
      <img className="mx-auto my-0 drop-shadow-lg" src={image} alt="" />
      <input ref={ref} type="file" onChange={handleChange} className="hidden" />
    </button>
  )
}
