import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { Book } from '@/types/book'
import { NO_IMAGE } from '@/libs/constants'
import { useUiMode } from './UiModeProvider'
import {
  COMMAND_HELP,
  completeCommand,
  runCommand,
  TerminalSheet,
} from './commands'

interface Props {
  books: Book[]
  sheets: TerminalSheet[]
  year: string
  username: string
}

export function TerminalSheetView({ books, sheets, year, username }: Props) {
  const { mode, setMode } = useUiMode()
  const router = useRouter()
  const [atRoot, setAtRoot] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const draft = useRef('')
  const [log, setLog] = useState<Array<{ command: string; output: string }>>([])
  const [readerBook, setReaderBook] = useState<Book | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const readerRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const path = `/${username}/sheets${atRoot ? '' : `/${year}`}`

  useEffect(() => {
    setAtRoot(false)
    setReaderBook(null)
    setInput('')
  }, [year, username])

  useEffect(() => {
    if (readerBook) readerRef.current?.focus()
    else if (mode === 'cli') inputRef.current?.focus({ preventScroll: true })
  }, [readerBook, mode, year])

  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [log, busy])

  const append = (command: string, output: string) =>
    setLog((previous) => [...previous.slice(-99), { command, output }])

  const execute = async (command: string) => {
    if (!command.trim() || busy) return
    setHistory((previous) => [...previous.slice(-99), command])
    setHistoryIndex(null)
    setInput('')
    const result = runCommand(command, {
      username,
      currentSheet: atRoot ? null : year,
      sheets,
      books,
    })
    switch (result.type) {
      case 'text':
        append(command, result.text)
        break
      case 'clear':
        setLog([])
        break
      case 'less':
        append(command, result.book.title)
        setReaderBook(result.book)
        break
      case 'mode':
        append(command, result.mode)
        setMode(result.mode)
        break
      case 'cd':
        if (result.sheet === null) {
          setAtRoot(true)
          append(command, `/${username}/sheets`)
        } else {
          setBusy(true)
          try {
            if (result.sheet !== year) {
              const moved = await router.push(
                `/${encodeURIComponent(username)}/sheets/${encodeURIComponent(result.sheet)}`
              )
              if (!moved) throw new Error('navigation cancelled')
            }
            setAtRoot(false)
            append(command, `/${username}/sheets/${result.sheet}`)
          } catch {
            append(command, '移動できませんでした。もう一度お試しください。')
          } finally {
            setBusy(false)
          }
        }
        break
    }
  }

  const monthly = Array.from({ length: 12 }, (_, index) => {
    const month = `${index + 1}月`
    const count = books.filter((book) => book.month === month).length
    return `${String(index + 1).padStart(2, ' ')}月 │ ${'#'.repeat(Math.min(count, 40))} ${count}`
  }).join('\n')

  return (
    <section
      className="terminal-workspace my-6 rounded border p-4 sm:p-6"
      aria-label={mode === 'cli' ? '読書記録CLI' : 'ターミナル風の読書記録'}
    >
      <pre
        className="overflow-x-auto text-xs leading-5 sm:text-sm"
        aria-label="Kidoku 読書ターミナル"
      >{`+----------------------------------+
| K I D O K U  /  READING TERMINAL |
+----------------------------------+`}</pre>
      <p className="my-3 break-all text-sm">
        {path} <span className="terminal-muted">[{books.length} books]</span>
      </p>
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="シートの移動">
        {sheets.map((sheet) => (
          <Link
            key={sheet.id}
            href={`/${encodeURIComponent(username)}/sheets/${encodeURIComponent(sheet.name)}`}
            onClick={() => {
              if (sheet.name === year) setAtRoot(false)
            }}
            className="terminal-link border px-2 py-1 text-sm"
            aria-current={!atRoot && sheet.name === year ? 'page' : undefined}
          >
            [{sheet.name}]
          </Link>
        ))}
      </nav>

      {mode === 'cli' ? (
        <>
          <p className="terminal-muted mb-3 text-xs">
            help で使い方を表示。Tabで補完、↑↓で履歴。書影や画像は less
            で表示します。
          </p>
          <div
            ref={outputRef}
            role="log"
            aria-label="コマンドの実行結果"
            aria-live="polite"
            className="max-h-[50vh] overflow-auto"
          >
            {log.length === 0 && (
              <pre className="whitespace-pre-wrap text-xs">{COMMAND_HELP}</pre>
            )}
            {log.map((entry, index) => (
              <div key={index} className="mb-4 text-sm">
                <p className="terminal-muted break-all">$ {entry.command}</p>
                <pre className="whitespace-pre-wrap break-words">
                  {entry.output}
                </pre>
              </div>
            ))}
            {busy && <p role="status">シートを読み込み中…</p>}
          </div>
          <form
            className="mt-4 flex items-center gap-2 border-t pt-3"
            onSubmit={(event) => {
              event.preventDefault()
              void execute(input)
            }}
          >
            <span aria-hidden="true">$</span>
            <input
              ref={inputRef}
              value={input}
              disabled={busy}
              aria-label="CLIコマンド"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent py-2 outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="tree / cd 2026 / less 123"
              onChange={(event) => {
                setInput(event.target.value)
                setHistoryIndex(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  if (!history.length) return
                  if (historyIndex === null) draft.current = input
                  const next =
                    event.key === 'ArrowUp'
                      ? Math.max(0, (historyIndex ?? history.length) - 1)
                      : Math.min(
                          history.length,
                          (historyIndex ?? history.length) + 1
                        )
                  setHistoryIndex(next === history.length ? null : next)
                  setInput(
                    next === history.length ? draft.current : history[next]
                  )
                } else if (event.key === 'Tab' && !event.shiftKey && input) {
                  const matches = completeCommand(
                    input,
                    sheets,
                    atRoot ? [] : books
                  )
                  if (matches.length) {
                    event.preventDefault()
                    if (matches.length === 1) setInput(matches[0])
                    else append(input, matches.join('\n'))
                  }
                }
              }}
            />
            <button
              type="submit"
              disabled={busy}
              className="border px-3 py-2 text-xs"
            >
              実行
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="mb-2 text-sm">[ monthly reading ]</h2>
          <pre className="mb-6 overflow-x-auto text-sm">{monthly}</pre>
          <h2 className="mb-2 text-sm">[ categories ]</h2>
          <pre className="mb-6 whitespace-pre-wrap text-sm">
            {Object.entries(
              books.reduce<Record<string, number>>((counts, book) => {
                const name = book.category || '未分類'
                counts[name] = (counts[name] || 0) + 1
                return counts
              }, {})
            )
              .map(([name, count]) => `${name} : ${count}`)
              .join('\n') || '(empty)'}
          </pre>
          <h2 className="mb-2 text-sm">[ books / {year} ]</h2>
          {books.length === 0 && (
            <p className="terminal-muted">本はまだありません。</p>
          )}
          <ul>
            {books.map((book, index) => (
              <li
                key={book.id}
                className="flex items-start gap-3 border-b py-3"
              >
                <span aria-hidden="true">
                  {index === books.length - 1 ? '└──' : '├──'}
                </span>
                <button
                  className="shrink-0"
                  aria-label={`${book.title}を読む`}
                  onClick={() => setReaderBook(book)}
                >
                  <img
                    src={
                      book.image && book.image !== '-' ? book.image : NO_IMAGE
                    }
                    alt={book.title}
                    width={48}
                    loading="lazy"
                  />
                </button>
                <button
                  className="min-w-0 text-left text-sm hover:underline"
                  onClick={() => setReaderBook(book)}
                >
                  <span className="block break-words">
                    {book.id} {book.title}
                  </span>
                  <span className="terminal-muted block">
                    {book.author} / {book.category || '未分類'} /{' '}
                    {book.impression}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {readerBook && (
        <div className="mt-6 border-t pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm">less / {readerBook.id}</h2>
            <div className="flex gap-3 text-sm">
              <Link
                className="terminal-link underline"
                href={`/books/${readerBook.id}`}
              >
                詳細・編集
              </Link>
              <button
                className="border px-2 py-1"
                onClick={() => setReaderBook(null)}
              >
                閉じる [q]
              </button>
            </div>
          </div>
          <div
            ref={readerRef}
            role="region"
            tabIndex={0}
            aria-label={`${readerBook.title}の閲覧`}
            className="max-h-[65vh] overflow-auto p-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.key === 'q' || event.key === 'Escape') {
                event.preventDefault()
                setReaderBook(null)
              } else if (['j', 'k', ' ', 'b', 'g', 'G'].includes(event.key)) {
                event.preventDefault()
                const view = event.currentTarget
                if (event.key === 'g' || event.key === 'G')
                  view.scrollTop = event.key === 'g' ? 0 : view.scrollHeight
                else
                  view.scrollBy({
                    top:
                      event.key === 'j'
                        ? 60
                        : event.key === 'k'
                          ? -60
                          : (event.key === 'b' ? -1 : 1) *
                            view.clientHeight *
                            0.8,
                  })
              }
            }}
          >
            <img
              className="mb-4 max-h-60 max-w-full object-contain"
              src={
                readerBook.image && readerBook.image !== '-'
                  ? readerBook.image
                  : NO_IMAGE
              }
              alt={readerBook.title}
            />
            <h3 className="mb-2 text-lg">{readerBook.title}</h3>
            <p className="terminal-muted mb-4 text-sm">
              {readerBook.author} / {readerBook.category} /{' '}
              {readerBook.impression}
            </p>
            <div className="terminal-memo space-y-3 break-words">
              <ReactMarkdown>
                {readerBook.memo || '表示できるメモはありません。'}
              </ReactMarkdown>
            </div>
          </div>
          <p className="terminal-muted mt-2 text-xs">
            j/k: スクロール · Space/b: ページ送り · g/G: 先頭/末尾 · q/Esc:
            閉じる
          </p>
        </div>
      )}
    </section>
  )
}
