import type { AiSummariesJson } from '@/features/sheet/components/AiSummaries/types'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Book } from '@/types/book'
import { useUiMode } from './UiModeProvider'
import { ansi } from './ansi'
import { AnsiText } from './AnsiText'
import { LessPager } from './LessPager'
import {
  BANNER,
  completeCommand,
  runCommand,
  SHELL,
  TerminalSheet,
} from './commands'

interface Props {
  aiSummary?: AiSummariesJson
  books: Book[]
  sheets: TerminalSheet[]
  year: string
  username: string
}

interface Entry {
  id: number
  cwd: string
  /** null はプロンプトを伴わない出力（ログインメッセージなど） */
  command: string | null
  output: string
}

const MAX_ENTRIES = 300

function Prompt({ username, cwd }: { username: string; cwd: string }) {
  return (
    <span aria-hidden="true">
      <span className="ansi-bold ansi-2">
        {username}@{SHELL}
      </span>
      :<span className="ansi-bold ansi-4">{cwd}</span>${' '}
    </span>
  )
}

export function CliSheetView({
  books,
  sheets,
  year,
  username,
  aiSummary,
}: Props) {
  const { setMode } = useUiMode()
  const router = useRouter()
  const [atRoot, setAtRoot] = useState(false)
  const [input, setInput] = useState('')
  const [caret, setCaret] = useState(0)
  const pendingCaret = useRef<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const draft = useRef('')
  const nextId = useRef(1)
  const [log, setLog] = useState<Entry[]>(() => [
    {
      id: 0,
      cwd: '',
      command: null,
      output: [
        ansi.gray(
          `Last login: ${new Date().toString().slice(0, 24)} on ttys001`
        ),
        '',
        ansi.cyan(BANNER),
        '',
        `Welcome to ${ansi.bold(`${SHELL} shell`)}. ${ansi.gray(`(${username}/${year}: ${books.length} books)`)}`,
        `${ansi.green('help')} でコマンド一覧、${ansi.green('exit')} で通常表示に戻ります。`,
        '',
      ].join('\n'),
    },
  ])
  const [readerBook, setReaderBook] = useState<Book | null>(null)
  const [busy, setBusy] = useState(false)
  const windowRef = useRef<HTMLElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cwd = atRoot ? '~/sheets' : `~/sheets/${year}`

  useEffect(() => {
    setAtRoot(false)
    setReaderBook(null)
  }, [year, username])

  useEffect(() => {
    if (!readerBook && !busy) inputRef.current?.focus({ preventScroll: true })
  }, [readerBook, busy])

  useEffect(() => {
    const screen = screenRef.current
    if (screen) screen.scrollTop = screen.scrollHeight
  }, [log, busy, input, readerBook])

  useLayoutEffect(() => {
    if (pendingCaret.current === null) return
    inputRef.current?.setSelectionRange(
      pendingCaret.current,
      pendingCaret.current
    )
    pendingCaret.current = null
  })

  const setLine = (value: string, position = value.length) => {
    setInput(value)
    setCaret(position)
    pendingCaret.current = position
  }

  const append = (command: string | null, output: string, at = cwd) =>
    setLog((previous) => [
      ...previous.slice(-(MAX_ENTRIES - 1)),
      { id: nextId.current++, cwd: at, command, output },
    ])

  const execute = async (command: string) => {
    if (busy) return
    setLine('')
    setHistoryIndex(null)
    if (!command.trim()) {
      append(command, '')
      return
    }
    const nextHistory = [...history.slice(-499), command]
    setHistory(nextHistory)
    const result = runCommand(command, {
      username,
      currentSheet: atRoot ? null : year,
      sheets,
      books,
      history: nextHistory,
      aiSummary,
    })
    switch (result.type) {
      case 'text':
        append(command, result.text)
        break
      case 'clear':
        setLog([])
        break
      case 'less':
        append(command, '')
        setReaderBook(result.book)
        break
      case 'open':
        append(command, result.text)
        void router.push(result.href)
        break
      case 'mode':
        append(command, result.text)
        setMode(result.mode)
        break
      case 'cd':
        if (result.sheet === null) {
          append(command, '')
          setAtRoot(true)
          break
        }
        if (result.sheet === year) {
          append(command, '')
          setAtRoot(false)
          break
        }
        append(command, '')
        setBusy(true)
        try {
          const moved = await router.push(
            `/${encodeURIComponent(username)}/sheets/${encodeURIComponent(result.sheet)}`
          )
          if (!moved) throw new Error('navigation cancelled')
          setAtRoot(false)
        } catch {
          append(null, `cd: ${result.sheet}: 移動できませんでした`)
        } finally {
          setBusy(false)
        }
        break
    }
  }

  const complete = () => {
    if (!input.trim()) return
    const { line, candidates } = completeCommand(
      input,
      sheets,
      atRoot ? [] : books
    )
    if (candidates.length) append(input, candidates.join('\n'))
    if (line !== input) setLine(line)
  }

  const moveHistory = (direction: -1 | 1) => {
    if (!history.length) return
    if (historyIndex === null) {
      if (direction === 1) return
      draft.current = input
    }
    const next = Math.min(
      history.length,
      Math.max(0, (historyIndex ?? history.length) + direction)
    )
    setHistoryIndex(next === history.length ? null : next)
    setLine(next === history.length ? draft.current : history[next])
  }

  const interrupt = () => {
    append(`${input}^C`, '')
    setLine('')
    setHistoryIndex(null)
  }

  const clearScreen = () => setLog([])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // IMEの変換確定中のキーはブラウザに任せる
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      if (event.key === 'Enter') event.preventDefault()
      return
    }
    const position = event.currentTarget.selectionStart ?? input.length
    if (event.ctrlKey && !event.metaKey && !event.altKey) {
      const key = event.key.toLowerCase()
      if (key === 'c') interrupt()
      else if (key === 'l') clearScreen()
      else if (key === 'a') setLine(input, 0)
      else if (key === 'e') setLine(input)
      else if (key === 'u') setLine(input.slice(position), 0)
      else if (key === 'k') setLine(input.slice(0, position), position)
      else if (key === 'w') {
        const head = input.slice(0, position).replace(/\S+\s*$/, '')
        setLine(head + input.slice(position), head.length)
      } else if (key === 'p') moveHistory(-1)
      else if (key === 'n') moveHistory(1)
      else return
      event.preventDefault()
      return
    }
    if (event.key === 'ArrowUp') moveHistory(-1)
    else if (event.key === 'ArrowDown') moveHistory(1)
    else if (event.key === 'Tab' && !event.shiftKey) complete()
    else return
    event.preventDefault()
  }

  const syncCaret = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setCaret(event.currentTarget.selectionStart ?? input.length)

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void windowRef.current?.requestFullscreen?.()
  }

  const codePoint = input.codePointAt(caret)
  const caretEnd = caret + (codePoint && codePoint > 0xffff ? 2 : 1)

  return (
    <section
      ref={windowRef}
      className="cli-window flex flex-col"
      aria-label="読書記録CLI"
    >
      <div className="cli-titlebar">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cli-light bg-[#ff5f57]"
            aria-label="CLIを終了して通常表示に戻る"
            title="exit"
            onClick={() => setMode('normal')}
          />
          <span aria-hidden="true" className="cli-light bg-[#febc2e]" />
          <button
            type="button"
            className="cli-light bg-[#28c840]"
            aria-label="フルスクリーン切り替え"
            title="fullscreen"
            onClick={toggleFullscreen}
          />
        </div>
        <span className="min-w-0 flex-1 truncate text-center">
          {username}@{SHELL}: {cwd} — {SHELL}
        </span>
        <span className="w-[52px]" aria-hidden="true" />
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={screenRef}
          className="cli-screen h-full overflow-y-auto"
          onMouseUp={() => {
            if (!window.getSelection()?.toString())
              inputRef.current?.focus({ preventScroll: true })
          }}
        >
          <div role="log" aria-label="コマンドの実行結果" aria-live="polite">
            {log.map((entry) => (
              <div key={entry.id}>
                {entry.command !== null && (
                  <div className="cli-line">
                    <Prompt username={username} cwd={entry.cwd} />
                    {entry.command}
                  </div>
                )}
                {entry.output && (
                  <div className="cli-line">
                    <AnsiText text={entry.output} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {busy ? (
            <div className="cli-line" role="status">
              <span className="cli-cursor cli-cursor-blink"> </span>
            </div>
          ) : (
            <form
              className="cli-line relative"
              onSubmit={(event) => {
                event.preventDefault()
                void execute(input)
              }}
            >
              <Prompt username={username} cwd={cwd} />
              <span aria-hidden="true">
                {input.slice(0, caret)}
                <span
                  className={
                    focused && !readerBook
                      ? 'cli-cursor cli-cursor-blink'
                      : 'cli-cursor-idle'
                  }
                >
                  {input.slice(caret, caretEnd) || ' '}
                </span>
                {input.slice(caretEnd)}
              </span>
              <input
                ref={inputRef}
                value={input}
                aria-label="CLIコマンド"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                className="cli-input-capture"
                onChange={(event) => {
                  setInput(event.target.value)
                  setCaret(event.target.selectionStart ?? 0)
                  setHistoryIndex(null)
                }}
                onSelect={syncCaret}
                onKeyUp={syncCaret}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </form>
          )}
        </div>
        {readerBook && (
          <LessPager
            book={readerBook}
            onQuit={() => setReaderBook(null)}
            onOpen={(href) => void router.push(href)}
          />
        )}
      </div>

      {/* タッチ端末にはTabや矢印キーがないため補助キーを表示する */}
      <div className="cli-keybar" aria-label="補助キー">
        {(
          [
            ['Tab', complete],
            ['↑', () => moveHistory(-1)],
            ['↓', () => moveHistory(1)],
            ['^C', interrupt],
            ['^L', clearScreen],
            ['ls', () => void execute('ls')],
            ['cd ..', () => void execute('cd ..')],
            ['help', () => void execute('help')],
          ] as Array<[string, () => void]>
        ).map(([label, action]) => (
          <button
            key={label}
            type="button"
            className="cli-key"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              action()
              inputRef.current?.focus({ preventScroll: true })
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
