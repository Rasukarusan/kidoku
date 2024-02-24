import React, { useEffect, useRef, useState } from 'react'
import {
  BrowserMultiFormatReader,
  // BarcodeFormat,
  // DecodeHintType,
} from '@zxing/library'
import { uniq } from '@/utils/array'

function BarcodeScanner() {
  const videoRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const [barcodes, setBarcodes] = useState([])
  const [screenshot, setScreenshot] = useState(null) // スクリーンショットを保存するためのstate

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
          undefined,
          previewElem,
          (result, err) => {
            if (result) {
              console.log(result)
              // バーコードが読み取れたらstateを更新
              const code = result.getText()
              setBarcodes(uniq([...barcodes, code]))
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
    if (!imgRef) return
    const screenshot = imgRef.current
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = screenshot.clientWidth
    canvas.height = screenshot.clientHeight
    context.drawImage(screenshot, 0, 0, canvas.width, canvas.height)

    const segmentWidth = canvas.width / 3
    const segments = [0, 1, 2].map((index) => {
      const segmentCanvas = document.createElement('canvas')
      segmentCanvas.width = segmentWidth
      segmentCanvas.height = canvas.height
      const segmentContext = segmentCanvas.getContext('2d')
      console.log(segmentWidth, canvas.height)
      segmentContext.drawImage(
        canvas,
        index * segmentWidth,
        0,
        segmentWidth,
        canvas.height,
        0,
        0,
        segmentWidth,
        canvas.height
      )

      return segmentCanvas
    })

    drawSegmentsToCanvas(segments, 0)
  }
  const drawSegmentsToCanvas = (segments, index) => {
    if (index < segments.length && canvasRef.current) {
      // 全体のcanvasのサイズを更新する
      canvasRef.current.width = segments[0].width * (index + 1) // 表示されるセグメントに応じて幅を調整
      canvasRef.current.height = segments[0].height
      const context = canvasRef.current.getContext('2d')

      // 最初から指定されたindexまでのセグメントを描画する
      for (let i = 0; i <= index; i++) {
        context.drawImage(segments[i], i * segments[i].width, 0)
      }

      // 次のセグメントがあれば、再度この関数を呼び出す
      if (index + 1 < segments.length) {
        setTimeout(() => {
          drawSegmentsToCanvas(segments, index + 1)
        }, 1000) // 次のセグメントを5秒後に描画
      }
    }
  }

  return (
    <div>
      <h3>Scanned barcode:</h3>
      <p>{barcodes.join(', ')}</p>
      <button
        onClick={() => {
          console.log(screenshot)
          captureScreenshotAndSplit()
          //   const codeReader = new BrowserBarcodeReader()
          //   codeReader
          //     .decodeFromImage(imgRef.current)
          //     .then((result) => {
          //       console.log(result)
          //     })
          //     .catch((err) => {
          //       console.error(err)
          //     })
        }}
      >
        SCAN!
      </button>
      <video ref={videoRef} style={{ width: '50%' }} autoPlay></video>
      {screenshot && (
        <img
          ref={imgRef}
          src={screenshot}
          alt="Screenshot"
          className="h-1/3 w-1/3"
        />
      )}
      <canvas ref={canvasRef} style={{ width: '300px' }} />
    </div>
  )
}

export default BarcodeScanner
