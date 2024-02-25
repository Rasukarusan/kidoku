import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { searchBooksByIsbn } from '@/utils/search'
import { Loading } from '@/components/icon/Loading'
import { SearchResult } from '@/types/search'

interface Props {
  onDetect: (result: SearchResult) => void
}
export const BarcodeScanner: React.FC<Props> = ({ onDetect }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [animate, setAnimate] = useState<boolean>(false)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    const startScan = async () => {
      if (
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      ) {
        // カメラを起動し、video要素と結びつけ
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (!videoRef.current) return
        videoRef.current.srcObject = videoStream

        // デコード処理
        codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          async (res, err) => {
            if (!res) return
            setLoading(true)
            const isbn = res.getText()
            const result = await searchBooksByIsbn(isbn)
            console.log(result)
            if (result) {
              setLoading(false)
              onDetect(result)
              const res: Response = await fetch(`/api/barcode`, {
                method: 'POST',
                body: JSON.stringify({ book: result }),
                headers: {
                  Accept: 'application/json',
                },
              })
            }
          }
        )
      }
    }
    startScan()

    // 5秒経っても画面を開いている場合、ヒントをアニメーションさせる
    setTimeout(() => {
      setAnimate(true)
    }, 5000)

    // コンポーネントのアンマウント時にスキャンを停止
    return () => {
      codeReader.reset()
    }
  }, [])

  return (
    <div className="relative mx-auto my-0 rounded-md">
      <div className="bg-white pb-2 text-center text-xs font-bold text-gray-600">
        許可するとカメラが起動します
      </div>
      <video
        ref={videoRef}
        autoPlay
        className="mx-auto my-0 max-h-80 w-full"
      ></video>
      {loading && (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center">
          <Loading className="mb-2 h-[36px] w-[36px] border-green-500" />
        </div>
      )}
      <div
        className={`bg-white pt-2 text-center text-xs font-bold text-gray-600 ${animate ? 'animate-bounce text-green-600' : ''}`}
      >
        バーコードの1段目が映るようにすると成功率があがります
      </div>
    </div>
  )
}
