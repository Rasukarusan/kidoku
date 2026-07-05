import { useState } from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import useSWR from 'swr'
import dayjs from 'dayjs'
import { Container } from '@/components/layout/Container'

interface TokenInfo {
  id: number
  name: string
  lastUsedAt: string | null
  created: string
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

// パーソナルアクセストークンの管理ページ
export const ApiTokensPage: React.FC = () => {
  const { data, mutate } = useSWR<{ tokens: TokenInfo[] }>(
    '/api/me/tokens',
    fetcher
  )
  const [name, setName] = useState('')
  const [issued, setIssued] = useState<{ name: string; token: string } | null>(
    null
  )
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const tokens = data?.tokens ?? []

  const onCreate = async () => {
    setError('')
    if (!name.trim()) {
      setError('トークン名を入力してください')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/me/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'トークンの作成に失敗しました')
        return
      }
      setIssued({ name: result.name, token: result.token })
      setName('')
      setCopied(false)
      await mutate()
    } catch {
      setError('トークンの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const onDelete = async (token: TokenInfo) => {
    if (
      !window.confirm(
        `「${token.name}」を削除しますか？このトークンを使うアプリは動かなくなります。`
      )
    )
      return
    await fetch(`/api/me/tokens?id=${token.id}`, { method: 'DELETE' })
    await mutate()
  }

  const onCopy = async () => {
    if (!issued) return
    await navigator.clipboard.writeText(issued.token)
    setCopied(true)
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="個人用API | kidoku" />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">個人用API</h2>
        <Link
          href="/settings/profile"
          className="text-sm text-blue-500 hover:underline"
        >
          設定に戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        パーソナルアクセストークンを発行すると、自分の読書記録を外部ツールから読み取れます（読み取り専用）。
      </p>

      {/* 発行直後のトークン表示 */}
      {issued && (
        <section className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-6">
          <h3 className="mb-2 text-sm font-bold text-teal-800">
            「{issued.name}」のトークンが発行されました
          </h3>
          <p className="mb-3 text-xs text-teal-700">
            このトークンは今しか表示されません。必ずコピーして安全な場所に保管してください。
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded bg-white px-3 py-2 font-mono text-xs">
              {issued.token}
            </code>
            <button
              className="shrink-0 rounded-md bg-teal-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-600"
              onClick={onCopy}
            >
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>
        </section>
      )}

      {/* 新規作成 */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">新しいトークン</h3>
        <div className="flex gap-2">
          <input
            value={name}
            placeholder="例: Obsidian連携"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white sm:max-w-80"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            disabled={creating}
            onClick={onCreate}
          >
            発行
          </button>
        </div>
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      </section>

      {/* 一覧 */}
      {tokens.length > 0 && (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-bold text-gray-700">トークン一覧</h3>
          <ul className="divide-y divide-slate-100">
            {tokens.map((token) => (
              <li
                key={token.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm text-gray-800">{token.name}</div>
                  <div className="text-xs text-gray-400">
                    作成 {dayjs(token.created).format('YYYY/MM/DD')}
                    {token.lastUsedAt
                      ? ` ・ 最終使用 ${dayjs(token.lastUsedAt).format('YYYY/MM/DD HH:mm')}`
                      : ' ・ 未使用'}
                  </div>
                </div>
                <button
                  className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                  onClick={() => onDelete(token)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 使い方 */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-2 text-sm font-bold text-gray-700">使い方</h3>
        <p className="mb-2 text-xs text-gray-500">
          発行したトークンをAuthorizationヘッダーに指定して読書記録を取得できます。
        </p>
        <pre className="overflow-x-auto rounded bg-slate-900 p-4 font-mono text-xs text-slate-100">
          {`curl -H "Authorization: Bearer <トークン>" \\\n  "${typeof window !== 'undefined' ? window.location.origin : 'https://kidoku.net'}/api/v1/books?page=1&perPage=100"`}
        </pre>
        <p className="mt-2 text-xs text-gray-500">
          読了日の新しい順に返されます。page（ページ番号、1始まり）とperPage（1ページあたりの件数、デフォルト100・最大200）でページネーションできます。
        </p>
      </section>
    </Container>
  )
}
