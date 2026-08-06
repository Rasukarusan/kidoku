import dayjs from 'dayjs'
import { CodexDeviceCode } from './CodexDeviceCode'
import { useCodexConnect } from './useCodexConnect'

/** 設定画面で使う、自分のChatGPTアカウント接続の管理パネル */
export const CodexConnectPanel: React.FC = () => {
  const { status, device, starting, notice, error, start, cancel, disconnect } =
    useCodexConnect()

  const onDisconnect = async () => {
    if (
      !window.confirm(
        '接続を解除しますか？解除するとAI分析が使えなくなります。'
      )
    )
      return
    await disconnect()
  }

  return (
    <>
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">接続状況</h3>
        {!status ? (
          <p className="text-sm text-gray-400">確認中...</p>
        ) : status.connected ? (
          <div className="text-sm">
            <p className="mb-1 font-medium text-teal-700">
              接続済み
              {status.expired && (
                <span className="ml-2 text-xs font-normal text-amber-600">
                  トークンの期限切れ（分析の実行時に自動更新されます）
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              アカウントID: {status.accountId ?? '不明'}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              トークン期限: {dayjs(status.expiresAt).format('YYYY/MM/DD HH:mm')}
            </p>
            <button
              className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
              onClick={onDisconnect}
            >
              接続を解除する
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            未接続です。AI分析は接続後に利用できます。
          </p>
        )}
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-2 text-sm font-bold text-gray-700">
          ChatGPTでログイン
        </h3>
        {device ? (
          <CodexDeviceCode device={device} onCancel={cancel} />
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-500">
              事前にChatGPTの Settings → Security →「Allow device code
              login」を有効にしてください。
            </p>
            <button
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={starting}
              onClick={start}
            >
              {starting
                ? '開始中...'
                : status?.connected
                  ? '別のアカウントでログインする'
                  : 'ChatGPTでログイン'}
            </button>
          </>
        )}
        {notice && <div className="mt-3 text-xs text-teal-700">{notice}</div>}
        {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
      </section>
    </>
  )
}
