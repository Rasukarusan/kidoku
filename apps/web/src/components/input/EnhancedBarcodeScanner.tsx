import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from '@zxing/library'
import { searchBookWithRetry } from '@/utils/bookApi'
import { validateISBN, normalizeISBN } from '@/utils/isbn'
import { Loading } from '@/components/icon/Loading'
import { SearchResult } from '@/types/search'

interface Props {
  onDetect: (result: SearchResult) => void
  onError?: (error: string) => void
}

type ScanState = 'idle' | 'scanning' | 'processing' | 'success' | 'error'

export const EnhancedBarcodeScanner: React.FC<Props> = ({
  onDetect,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [lastScannedISBN, setLastScannedISBN] = useState<string>('')
  const [showHint, setShowHint] = useState<boolean>(false)
  const [cameraPermission, setCameraPermission] = useState<boolean>(true)
  const [manualInput, setManualInput] = useState<string>('')
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // エラーメッセージをセットする関数
  const handleError = useCallback(
    (message: string) => {
      setErrorMessage(message)
      setScanState('error')
      onError?.(message)

      // 3秒後にエラーメッセージをクリア
      setTimeout(() => {
        setErrorMessage('')
        setScanState('scanning')
      }, 3000)
    },
    [onError]
  )

  // スキャン成功時の処理
  const handleScanSuccess = useCallback(
    async (isbn: string) => {
      // 同じISBNを連続でスキャンしないようにする
      if (isbn === lastScannedISBN) return

      const normalizedISBN = normalizeISBN(isbn)

      // ISBN形式の検証
      if (!validateISBN(normalizedISBN)) {
        handleError('無効なISBN形式です')
        return
      }

      setScanState('processing')
      setLastScannedISBN(isbn)

      try {
        const result = await searchBookWithRetry(normalizedISBN)
        if (result) {
          setScanState('success')
          // 成功アニメーションを表示
          setTimeout(() => {
            onDetect(result)
          }, 500)
        } else {
          handleError('書籍が見つかりませんでした')
        }
      } catch (error) {
        handleError('検索中にエラーが発生しました')
      }
    },
    [lastScannedISBN, onDetect, handleError]
  )

  // 手動入力の処理
  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!manualInput) return

      await handleScanSuccess(manualInput)
      setManualInput('')
    },
    [manualInput, handleScanSuccess]
  )

  // カメラのセットアップ
  useEffect(() => {
    const setupCamera = async () => {
      if (!cameraPermission || showManualInput) return

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraPermission(false)
          handleError('カメラがサポートされていません')
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setScanState('scanning')
        }

        // バーコードリーダーのセットアップ
        const codeReader = new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader

        // スキャン開始
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result: Result | null, error?: Error) => {
            if (result) {
              const isbn = result.getText()
              await handleScanSuccess(isbn)
            } else if (error && !(error instanceof NotFoundException)) {
              console.error('Scan error:', error)
            }
          }
        )
      } catch (error) {
        console.error('Camera setup error:', error)
        setCameraPermission(false)
        handleError('カメラへのアクセスが拒否されました')
      }
    }

    setupCamera()

    // ヒント表示のタイマー
    const hintTimer = setTimeout(() => {
      setShowHint(true)
    }, 5000)

    // クリーンアップ
    return () => {
      clearTimeout(hintTimer)
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraPermission, showManualInput, handleScanSuccess, handleError])

  return (
    <div className="relative mx-auto rounded-lg bg-white p-4 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-3 text-center">
        <h3 className="text-sm font-semibold text-gray-700">
          バーコードスキャン
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {scanState === 'idle' && 'カメラを起動しています...'}
          {scanState === 'scanning' && 'バーコードを枠内に合わせてください'}
          {scanState === 'processing' && '書籍情報を検索中...'}
          {scanState === 'success' && '✓ スキャン成功！'}
          {scanState === 'error' && errorMessage}
        </p>
      </div>

      {/* カメラビュー */}
      {cameraPermission && !showManualInput && (
        <div className="relative mb-3 overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-full object-cover"
          />

          {/* スキャンガイド */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-32 w-48">
              {/* 四隅のコーナーマーク */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-green-400"></div>
              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-green-400"></div>
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-green-400"></div>
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-green-400"></div>

              {/* スキャンライン（アニメーション） */}
              {scanState === 'scanning' && (
                <div className="absolute left-0 right-0 h-0.5 animate-scan bg-green-400"></div>
              )}
            </div>
          </div>

          {/* 状態表示オーバーレイ */}
          {scanState === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Loading className="h-10 w-10 border-green-400" />
            </div>
          )}

          {scanState === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-scale-in rounded-full bg-green-500 p-3">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 手動入力フォーム */}
      {(showManualInput || !cameraPermission) && (
        <form onSubmit={handleManualSubmit} className="mb-3">
          <div className="mb-2">
            <label
              htmlFor="isbn-input"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              ISBN番号を入力
            </label>
            <input
              id="isbn-input"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="9784xxxxxxxxx"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!manualInput || scanState === 'processing'}
            className="w-full rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {scanState === 'processing' ? '検索中...' : '検索'}
          </button>
        </form>
      )}

      {/* ヒントとオプション */}
      <div className="space-y-2 text-center">
        {showHint && cameraPermission && !showManualInput && (
          <p className="animate-fade-in text-xs text-green-600">
            💡
            バーコードの1段目（数字部分）が枠内に収まるようにすると認識率が上がります
          </p>
        )}

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs text-blue-600 underline hover:text-blue-700"
        >
          {showManualInput ? 'カメラスキャンに戻る' : 'ISBN番号を手動で入力'}
        </button>
      </div>
    </div>
  )
}
