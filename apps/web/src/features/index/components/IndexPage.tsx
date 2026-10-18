import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { Check, Copy } from 'lucide-react'
import { openSearchModalAtom } from '@/store/modal/atom'
import { MyRecentBooks } from './MyRecentBooks'
import { OnThisDay } from './OnThisDay'

interface Props {
  comments: Comment[]
  mcpEndpoint: string
}

export const IndexPage: React.FC<Props> = ({ comments, mcpEndpoint }) => {
  const router = useRouter()
  const [, setOpenSearchModal] = useAtom(openSearchModalAtom)

  // オンボーディング直後（?start=1）は最初の1冊登録モーダルを自動で開く
  useEffect(() => {
    if (router.query.start === '1') {
      setOpenSearchModal(true)
      router.replace('/', undefined, { shallow: true })
    }
  }, [router, setOpenSearchModal])

  // 本の検索モーダルを開く（登録時にログインが必要なら都度案内される）
  const handleStart = () => {
    setOpenSearchModal(true)
  }

  const mcpClients = [
    {
      name: 'Claude Code',
      command: `claude mcp add --transport http kidoku ${mcpEndpoint}`,
    },
    { name: 'Codex', command: `codex mcp add kidoku --url ${mcpEndpoint}` },
  ]
  const [mcpClient, setMcpClient] = useState(mcpClients[0].name)
  const mcpAddCommand = mcpClients.find((c) => c.name === mcpClient).command
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(mcpAddCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* ヒーロー：淡々と記録する、を伝えるミニマルなファーストビュー */}
      <section className="border-b border-gray-100">
        <Container className="px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-2xl font-bold leading-relaxed tracking-wide text-gray-800 sm:text-3xl">
              読んだ本を、ただ記録する。
            </h1>
            <p className="mt-6 text-sm leading-loose text-gray-500 sm:text-base">
              派手な機能も、難しい操作もいりません。
              <br />
              日々読み終えた本を、自分のペースで淡々と。
              <br />
              ずっと続けられる、シンプルな読書記録。
            </p>
            <div className="mt-10">
              <button
                onClick={handleStart}
                className="rounded-full border border-gray-800 px-10 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-800 hover:text-white"
              >
                記録をはじめる
              </button>
            </div>
            <div className="mt-12">
              <div className="mx-auto max-w-lg overflow-hidden rounded-lg bg-gray-900 shadow-sm">
                <div className="flex items-center border-b border-gray-700 pl-2 pr-1">
                  <div role="tablist" className="flex">
                    {mcpClients.map((client) => (
                      <button
                        key={client.name}
                        role="tab"
                        aria-selected={client.name === mcpClient}
                        onClick={() => setMcpClient(client.name)}
                        className={`-mb-px border-b-2 px-3 py-2 text-xs transition-colors ${
                          client.name === mcpClient
                            ? 'border-white text-white'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {client.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCopy}
                    aria-label="コマンドをコピー"
                    className="ml-auto rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <code className="block break-all px-6 py-4 text-center font-mono text-sm text-gray-100">
                  <span className="select-none text-gray-500">$ </span>
                  {mcpAddCommand}
                </code>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ログインユーザー専用：最近登録した本セクション + あの日の一冊モーダル(1日1回) */}
      <MyRecentBooks />
      <OnThisDay />

      <Container className="p-6">
        <section>
          <div className="flex items-center">
            <h2 className="p-2 text-2xl font-bold">Comments</h2>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {comments.map((comment) => (
              <BookComment key={comment.id} comment={comment} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/comments" className="text-blue-500 hover:underline">
              さらに表示
            </Link>
          </div>
        </section>
      </Container>
    </>
  )
}
