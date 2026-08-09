import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BookOpen,
  MessageCircle,
  Minimize2,
  Sparkles,
} from 'lucide-react'
import { useCachedSession } from '@/hooks/useCachedSession'

type Message = { role: 'user' | 'assistant'; content: string }

const suggestions = [
  '最近読んだ本の傾向を教えて',
  'いちばん多く読んでいるジャンルは？',
  '過去のメモから次に読む本を考えて',
]

export function ReadingChat() {
  const { status } = useCachedSession()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const openChat = useCallback(() => setIsOpen(true), [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setIsOpen((current) => !current)
      }
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const ask = async (value: string) => {
    const normalized = value.trim()
    if (!normalized || isLoading) return

    setMessages((current) => [
      ...current,
      { role: 'user', content: normalized },
    ])
    setQuestion('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/reading-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: normalized }),
      })
      const data = (await response.json()) as {
        answer?: string
        error?: string
      }
      if (!response.ok || !data.answer) {
        throw new Error(data.error || '回答を生成できませんでした')
      }
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.answer as string },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `${error.message}。ChatGPTの接続状態も確認してください。`
              : '回答を生成できませんでした。時間をおいてお試しください。',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void ask(question)
  }

  if (status !== 'authenticated') return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 bottom-20 z-50 flex h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[410px]"
            aria-label="読書AIチャット"
          >
            <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700">
                <Sparkles size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-800">Kidoku AI</h2>
                <p className="text-xs text-slate-500">
                  あなたの読書記録に質問できます
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="チャットを閉じる"
              >
                <Minimize2 size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mb-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <BookOpen size={23} />
                    </div>
                    <h3 className="font-bold text-slate-800">
                      何でも聞いてください
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      登録した本や読書メモをもとにお答えします
                    </p>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void ask(suggestion)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-left text-sm text-slate-600 transition hover:border-violet-200 hover:bg-violet-50/60 hover:text-violet-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex gap-2.5 ${
                        message.role === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                          <Sparkles size={14} />
                        </div>
                      )}
                      <p
                        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-slate-800 text-white'
                            : 'rounded-tl-md bg-slate-100 text-slate-700'
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-400">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <Sparkles size={14} />
                      </div>
                      <span
                        className="flex gap-1"
                        aria-label="回答を考えています"
                      >
                        {[0, 1, 2].map((item) => (
                          <span
                            key={item}
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
                            style={{ animationDelay: `${item * 160}ms` }}
                          />
                        ))}
                      </span>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-slate-100 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                <textarea
                  ref={inputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void ask(question)
                    }
                  }}
                  maxLength={500}
                  rows={1}
                  placeholder="読書記録について質問する…"
                  className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="質問を送信"
                >
                  <ArrowUp size={17} />
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                ⌘ J でいつでも開閉
              </p>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl sm:bottom-6 sm:right-6"
          aria-label="読書AIチャットを開く"
        >
          <MessageCircle size={19} />
          <span>AIに聞く</span>
        </button>
      )}
    </>
  )
}
