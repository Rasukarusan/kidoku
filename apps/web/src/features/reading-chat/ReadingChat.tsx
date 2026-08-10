import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BookOpen,
  FileText,
  MessageCircle,
  Minimize2,
  Sparkles,
  X,
} from 'lucide-react'
import { useCachedSession } from '@/hooks/useCachedSession'

type Message = { role: 'user' | 'assistant'; content: string }

type PageContext = {
  type: 'book' | 'sheet' | 'report' | 'search' | 'other'
  label: string
  path: string
  bookId?: number
  sheetName?: string
  year?: number
}

type VisualViewportState = {
  height: number
  offsetTop: number
  isMobile: boolean
  isKeyboardOpen: boolean
}

function useVisualViewport(isOpen: boolean): VisualViewportState {
  const [viewport, setViewport] = useState<VisualViewportState>({
    height: 0,
    offsetTop: 0,
    isMobile: false,
    isKeyboardOpen: false,
  })

  useEffect(() => {
    if (!isOpen) return
    const visualViewport = window.visualViewport
    const initialHeight = window.innerHeight
    const update = () => {
      const height = visualViewport?.height ?? window.innerHeight
      setViewport({
        height,
        offsetTop: visualViewport?.offsetTop ?? 0,
        isMobile: window.matchMedia('(max-width: 639px)').matches,
        isKeyboardOpen: initialHeight - height > 150,
      })
    }
    update()
    visualViewport?.addEventListener('resize', update)
    visualViewport?.addEventListener('scroll', update)
    window.addEventListener('orientationchange', update)
    return () => {
      visualViewport?.removeEventListener('resize', update)
      visualViewport?.removeEventListener('scroll', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [isOpen])

  return viewport
}

const suggestions = [
  'このページについて教えて',
  '最近読んだ本の傾向を教えて',
  'いちばん多く読んでいるジャンルは？',
]

export function ReadingChat() {
  const router = useRouter()
  const { status } = useCachedSession()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pageTitle, setPageTitle] = useState('このページ')
  const [isContextAttached, setIsContextAttached] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const visualViewport = useVisualViewport(isOpen)

  const openChat = useCallback(() => setIsOpen(true), [])

  const pageContext = useMemo<PageContext>(() => {
    const path = router.asPath.split('?')[0]
    const first = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value
    if (router.pathname === '/books/[bookId]') {
      const bookId = Number(first(router.query.bookId))
      return {
        type: 'book',
        label: pageTitle || 'この本のページ',
        path,
        ...(Number.isInteger(bookId) && bookId > 0 ? { bookId } : {}),
      }
    }
    if (router.pathname.includes('/sheets/')) {
      const year = Number(first(router.query.year))
      return {
        type: 'sheet',
        label: Number.isInteger(year) ? `${year}年の読書記録` : '読書記録',
        path,
        ...(Number.isInteger(year) ? { year } : {}),
      }
    }
    if (router.pathname.startsWith('/report')) {
      return { type: 'report', label: '年間レポート', path }
    }
    if (router.pathname.startsWith('/search')) {
      return { type: 'search', label: '検索ページ', path }
    }
    const labels: Record<string, string> = {
      '/': 'ホーム',
      '/discover': '本を発見',
      '/comments': 'みんなの読書メモ',
      '/notifications': 'お知らせ',
    }
    return { type: 'other', label: labels[path] || pageTitle, path }
  }, [pageTitle, router.asPath, router.pathname, router.query])

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
    if (isOpen) {
      const title = document.title.split(/[|｜]/)[0]?.trim()
      if (title) setPageTitle(title)
      window.setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  useEffect(() => {
    setIsContextAttached(true)
  }, [router.asPath])

  useEffect(() => {
    if (!isOpen || !visualViewport.isMobile) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, visualViewport.isMobile])

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
        body: JSON.stringify({
          question: normalized,
          pageContext: isContextAttached ? pageContext : undefined,
        }),
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
            style={
              visualViewport.isMobile && visualViewport.height
                ? {
                    top: visualViewport.offsetTop + 8,
                    bottom: 'auto',
                    height: Math.max(1, visualViewport.height - 16),
                  }
                : undefined
            }
            className="fixed inset-x-2 bottom-20 z-50 flex h-[min(680px,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100vh-3rem))] sm:w-[410px]"
            aria-label="読書AIチャット"
          >
            <header
              className={`flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 ${
                visualViewport.isKeyboardOpen ? 'py-2' : 'py-3.5'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700">
                <Sparkles size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-800">Kidoku AI</h2>
                {!visualViewport.isKeyboardOpen && (
                  <p className="text-xs text-slate-500">
                    あなたの読書記録に質問できます
                  </p>
                )}
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

            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 ${
                visualViewport.isKeyboardOpen ? 'py-2' : 'py-5'
              }`}
            >
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

            <form
              onSubmit={submit}
              className="shrink-0 border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              {isContextAttached && (
                <div className="mb-2 flex items-center">
                  <div className="flex min-w-0 items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs text-violet-800">
                    <FileText size={14} className="shrink-0" />
                    <span className="max-w-[245px] truncate">
                      このページ: {pageContext.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsContextAttached(false)}
                      className="-mr-1 rounded-full p-0.5 text-violet-400 transition hover:bg-violet-100 hover:text-violet-700"
                      aria-label="ページ情報を外す"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}
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
                  placeholder={
                    isContextAttached
                      ? 'このページについて質問する…'
                      : '読書記録について質問する…'
                  }
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
              {!visualViewport.isKeyboardOpen && (
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  ⌘ J でいつでも開閉
                </p>
              )}
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
