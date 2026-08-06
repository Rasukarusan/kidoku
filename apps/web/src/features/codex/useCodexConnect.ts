import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  codexAuthStatusQuery,
  disconnectCodexAuthMutation,
  pollCodexDeviceAuthMutation,
  startCodexDeviceAuthMutation,
} from './api'

/** ポーリングを打ち切るまでの連続失敗回数 */
const MAX_POLL_ERRORS = 3

export interface CodexDeviceAuth {
  deviceAuthId: string
  userCode: string
  verificationUrl: string
  intervalSeconds: number
}

export interface CodexAuthStatus {
  connected: boolean
  accountId: string | null
  expiresAt: string | null
  expired: boolean
}

/**
 * 自分のChatGPTアカウント接続を扱うフック。
 * デバイスコードを表示し、認可されるまでポーリングして接続を完了させる。
 */
export const useCodexConnect = (options: { skip?: boolean } = {}) => {
  const [device, setDevice] = useState<CodexDeviceAuth | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollErrorCount = useRef(0)

  const { data, refetch } = useQuery(codexAuthStatusQuery, {
    fetchPolicy: 'cache-and-network',
    skip: options.skip,
  })
  const [startDeviceAuth, { loading: starting }] = useMutation(
    startCodexDeviceAuthMutation
  )
  const [pollDeviceAuth] = useMutation(pollCodexDeviceAuthMutation)
  const [disconnectCodexAuth] = useMutation(disconnectCodexAuthMutation)

  const status: CodexAuthStatus | undefined = data?.codexAuthStatus

  const stopPolling = () => {
    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = null
  }

  useEffect(() => stopPolling, [])

  const poll = async (auth: CodexDeviceAuth) => {
    try {
      const { data } = await pollDeviceAuth({
        variables: {
          input: {
            deviceAuthId: auth.deviceAuthId,
            userCode: auth.userCode,
          },
        },
      })
      pollErrorCount.current = 0
      if (data?.pollCodexDeviceAuth?.status !== 'authorized') return
      stopPolling()
      setDevice(null)
      setNotice('ChatGPTアカウントに接続しました')
      await refetch()
    } catch (e) {
      // 一時的な通信エラーは継続し、続けて失敗するなら諦める（コードの失効など）
      console.error('認可状況の確認に失敗しました', e)
      pollErrorCount.current += 1
      if (pollErrorCount.current < MAX_POLL_ERRORS) return
      stopPolling()
      setDevice(null)
      setError(
        'ログインを完了できませんでした。コードが失効した可能性があります。もう一度やり直してください。'
      )
    }
  }

  const start = async () => {
    setError('')
    setNotice('')
    pollErrorCount.current = 0
    try {
      const { data } = await startDeviceAuth()
      const auth = data?.startCodexDeviceAuth as CodexDeviceAuth
      setDevice(auth)
      window.open(auth.verificationUrl, '_blank', 'noopener')
      stopPolling()
      pollTimer.current = setInterval(
        () => poll(auth),
        Math.max(2, auth.intervalSeconds) * 1000
      )
    } catch (e) {
      console.error('デバイス認可の開始に失敗しました', e)
      setError(
        'ログインを開始できませんでした。ChatGPTの Settings → Security →「Allow device code login」が有効か確認してください。'
      )
    }
  }

  const cancel = () => {
    stopPolling()
    setDevice(null)
    setNotice('')
  }

  const disconnect = async () => {
    stopPolling()
    setDevice(null)
    setError('')
    await disconnectCodexAuth()
    setNotice('接続を解除しました')
    await refetch()
  }

  return { status, device, starting, notice, error, start, cancel, disconnect }
}
