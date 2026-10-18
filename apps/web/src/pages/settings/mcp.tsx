import { useState } from 'react'
import useSWR from 'swr'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { GetServerSideProps } from 'next'

export default function McpSettings({ endpoint }: { endpoint: string }) {
  const [message, setMessage] = useState('')
  const { data, error, mutate } = useSWR<{
    connections: {
      id: string
      clientName: string
      clientHost: string | null
      expiresAt: string
    }[]
  }>('/api/me/mcp-connections', async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('接続を取得できませんでした')
    return response.json()
  })
  async function disconnect(id: string) {
    setMessage('')
    const response = await fetch(
      `/api/me/mcp-connections?id=${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    ).catch(() => null)
    if (!response?.ok)
      setMessage('接続を解除できませんでした。もう一度お試しください。')
    else await mutate()
  }
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">MCP 接続</h1>
      <p className="mb-2">
        対応アプリの MCP 接続先に次の URL を設定し、Google
        ログインで読み取りを許可してください。
      </p>
      <code className="mb-6 block break-all rounded bg-gray-100 p-3">
        {endpoint}
      </code>
      <p className="mb-6">
        許可したアプリは、非公開のメモを含む読書記録を読み取れます。
      </p>
      {error && <p role="alert">接続を取得できませんでした。</p>}
      {message && <p role="alert">{message}</p>}
      {!data && !error && <p>読み込み中…</p>}
      {data?.connections.length === 0 && <p>接続中のアプリはありません。</p>}
      <ul>
        {data?.connections.map((connection) => (
          <li
            key={connection.id}
            className="flex items-center justify-between border-b py-4"
          >
            <span>
              {connection.clientName}
              {connection.clientHost && (
                <span className="ml-2 text-sm text-gray-500">
                  {connection.clientHost}
                </span>
              )}
            </span>
            <button
              className="rounded border px-3 py-2"
              onClick={() => disconnect(connection.id)}
            >
              接続を解除
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader('Cache-Control', 'no-store')
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id)
    return { redirect: { destination: '/', permanent: false } }
  const { mcpUrls } = await import('@/libs/mcp/oauth')
  return { props: { endpoint: mcpUrls().resource } }
}
