import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { searchBooksByIsbn } from '@/utils/search'
import { Loading } from '@/components/icon/Loading'
import { SearchResult } from '@/types/search'

function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<SearchResult>(null)

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
        videoRef.current.srcObject = videoStream

        // デコード処理
        codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          async (res, err) => {
            if (!res) return
            setLoading(true)
            // バーコードが読み取れたらstateを更新
            const isbn = res.getText()
            const result = await searchBooksByIsbn(isbn)
            console.log(result)
            if (result) {
              setLoading(false)
              setResult(result)
            }
          }
        )
      }
    }
    startScan()
    // コンポーネントのアンマウント時にスキャンを停止
    return () => {
      codeReader.reset()
    }
  }, [])

  return (
    <div>
      <h3>Scanned barcode:</h3>
      <div className="flex">
        <div className="relative mr-2">
          <video ref={videoRef} className="w-full" autoPlay></video>
          {loading && (
            <Loading className="absolute left-1/2 top-1/2 h-[36px] w-[36px] border-purple-500" />
          )}
        </div>
        <div className="w-1/2 bg-gray-100">{JSON.stringify(result)}</div>
      </div>
    </div>
  )
}

export default BarcodeScanner
