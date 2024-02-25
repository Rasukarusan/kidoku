import React, { useEffect, useRef, useState } from 'react'
import {
  BrowserBarcodeReader,
  BrowserMultiFormatReader,
  // BarcodeFormat,
  // DecodeHintType,
} from '@zxing/library'
import { uniq } from '@/utils/array'
import { searchBooksByIsbn } from '@/utils/search'
import { Loading } from '@/components/icon/Loading'

function BarcodeScanner() {
  const videoRef = useRef(null)
  const imgRef = useRef(null)
  const screenshotRef = useRef(null)
  const canvasRef = useRef(null)
  const [barcodes, setBarcodes] = useState([])
  const [screenshot, setScreenshot] = useState('/screenshot1.png')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  // スクリーンショットを取る関数
  const captureScreenshot = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas') // canvasエレメントを作成
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0) // ビデオの現在のフレームをcanvasに描画
      const dataUrl = canvas.toDataURL('image/png') // canvasの内容をdata URL (base64エンコードされたPNG)として取得
      setScreenshot(dataUrl) // stateを更新してスクリーンショットを保存
    }
  }

  useEffect(() => {
    // バーコードリーダーのインスタンスを生成
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
        const previewElem = videoRef.current
        codeReader.decodeFromVideoDevice(
          null,
          previewElem,
          async (result, err) => {
            if (result) {
              setLoading(true)
              // バーコードが読み取れたらstateを更新
              const isbn = result.getText()
              const books = await searchBooksByIsbn(isbn)
              console.log(books)
              setLoading(false)

              setBarcodes(uniq([...barcodes, isbn]))
              captureScreenshot()
              // 必要に応じてスキャンを停止
              // codeReader.reset()
            }
            if (err) {
              // console.log(err)
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

  const captureScreenshotAndSplit = () => {
    if (!screenshotRef) return
    const screenshot = screenshotRef.current
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = screenshot.clientWidth
    canvas.height = screenshot.clientHeight
    context.drawImage(screenshot, 0, 0, canvas.width, canvas.height)

    // 縦方向に分割するため、高さに基づいてセグメントを計算
    const splitCount = 5 // 分割数
    const segmentHeight = canvas.height / splitCount
    const segments = Array(splitCount)
      .fill(0)
      .map((_, index) => {
        const segmentCanvas = document.createElement('canvas')
        segmentCanvas.width = canvas.width
        segmentCanvas.height = segmentHeight
        const segmentContext = segmentCanvas.getContext('2d')
        segmentContext.drawImage(
          canvas,
          0,
          index * segmentHeight, // Y軸に沿って分割
          canvas.width,
          segmentHeight,
          0,
          0,
          canvas.width,
          segmentHeight
        )

        return segmentCanvas
      })

    drawSegmentsToCanvas(segments, 0)
  }

  const drawSegmentsToCanvas = (segments, index) => {
    if (index < segments.length && canvasRef.current) {
      canvasRef.current.width = segments[0].width // 全体の画像の幅は同じ
      canvasRef.current.height = segments[0].height * (index + 1) // 縦方向に分割された画像の高さに合わせて調整
      const context = canvasRef.current.getContext('2d')

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      // 縦方向にセグメントを描画する
      for (let i = 0; i <= index; i++) {
        context.drawImage(segments[i], 0, i * segments[i].height)
      }

      // 次のセグメントの描画
      if (index + 1 < segments.length) {
        setTimeout(() => {
          drawSegmentsToCanvas(segments, index + 1)
          // Canvasから画像データを取得しimg要素にセット
          const imageUrl = canvasRef.current.toDataURL('image/png')
          const img = imgRef.current
          img.src = imageUrl
          console.log(img)
          scanBarcodeFromImage(img)
        }, 1000) // 指定されたディレイ（ここでは1秒）後に実行
      }
    }
  }

  const scanBarcodeFromImage = (img) => {
    console.log(img)
    const codeReader = new BrowserBarcodeReader()
    codeReader
      .decodeFromImage('split')
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <div>
      <h3>Scanned barcode:</h3>
      <p>{barcodes.join(',')}</p>
      <div className="mb-4">
        <button
          className="mr-4 rounded-md bg-blue-100 px-2 py-1"
          onClick={() => captureScreenshotAndSplit()}
        >
          分割しながら描画
        </button>
        <button
          className="rounded-md bg-purple-200 px-2 py-1"
          onClick={async () => {
            for (let i = 0; i < 100; i++) {
              const codeReader = new BrowserBarcodeReader()
              codeReader
                .decodeFromImage('split')
                .then((result) => {
                  console.log(result)
                  setResult(JSON.stringify(result))
                })
                .catch((err) => {
                  console.error('エラーです')
                  // console.error(err)
                  setResult(JSON.stringify(err))
                })
            }
          }}
        >
          分割したものをスキャン
        </button>
      </div>
      <div className="mb-2 flex">
        <div className="relative">
          <video ref={videoRef} className="w-full" autoPlay></video>
          {loading && (
            <Loading className="absolute left-1/2 top-1/2 h-[36px] w-[36px] border-purple-500" />
          )}
        </div>
        {screenshot && (
          <img
            ref={screenshotRef}
            src={screenshot}
            alt="Screenshot"
            className="h-1/3 w-1/3 bg-gray-100"
          />
        )}
      </div>
      <canvas ref={canvasRef} style={{ width: '300px' }} />
      <div className="flex">
        <img
          id="split"
          ref={imgRef}
          className="h-1/3 w-1/3"
          src="/screenshot1.png"
        />
        <pre className="w-1/2 text-wrap bg-gray-50">{result}</pre>
      </div>
    </div>
  )
}

export default BarcodeScanner
