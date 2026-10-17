import { useEffect, useMemo, useRef, useState } from 'react'
import { Book } from '@/types/book'
import { sanitize } from './ansi'
import { fuzzyFilter } from './fuzzy'

export type FinderAction = 'less' | 'vim'

interface Props {
  books: Book[]
  initialQuery?: string
  onSelect: (book: Book, action: FinderAction) => void
  onCancel: () => void
}

export const finderLine = (book: Book) =>
  `${book.id}  ${sanitize(book.title)}  ${sanitize(book.author)}`

function Highlighted({
  text,
  positions,
}: {
  text: string
  positions: number[]
}) {
  const marked = new Set(positions)
  return (
    <>
      {Array.from(text).map((char, index) =>
        marked.has(index) ? (
          <span key={index} className="ansi-2 ansi-bold">
            {char}
          </span>
        ) : (
          char
        )
      )}
    </>
  )
}

/** fzf 風のファインダー。下から順に候補を並べ、右側（狭い画面では上側）にメモをプレビューする */
export function FuzzyFinder({
  books,
  initialQuery = '',
  onSelect,
  onCancel,
}: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const matches = useMemo(
    () => fuzzyFilter(books, query, finderLine),
    [books, query]
  )
  const selected = matches[Math.min(cursor, matches.length - 1)]?.item

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    setCursor(0)
  }, [query])

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest' })
    previewRef.current?.scrollTo?.({ top: 0 })
  }, [selected])

  const move = (delta: number) =>
    setCursor((current) =>
      Math.max(0, Math.min(matches.length - 1, current + delta))
    )

  const choose = (action: FinderAction) => {
    if (selected) onSelect(selected, action)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    const key = event.ctrlKey
      ? `C-${event.key.toLowerCase()}`
      : event.shiftKey && event.key === 'Tab'
        ? 'S-Tab'
        : event.key
    const preview = previewRef.current
    const page = (preview?.clientHeight ?? 0) * 0.8
    if (key === 'Enter') choose('less')
    else if (key === 'C-e') choose('vim')
    else if (['Escape', 'C-c', 'C-g', 'C-q'].includes(key)) onCancel()
    // 候補は下から並ぶため、上キーで次の候補に移る
    else if (event.shiftKey && key === 'ArrowUp')
      preview?.scrollBy({ top: -page })
    else if (event.shiftKey && key === 'ArrowDown')
      preview?.scrollBy({ top: page })
    else if (['ArrowUp', 'C-p', 'C-k', 'S-Tab'].includes(key)) move(1)
    else if (['ArrowDown', 'C-n', 'C-j', 'Tab'].includes(key)) move(-1)
    else if (key === 'C-u') setQuery('')
    else return
    event.preventDefault()
  }

  return (
    <div
      className="cli-pager absolute inset-0 flex flex-col"
      role="dialog"
      aria-label="lk"
    >
      <div className="flex min-h-0 flex-1 flex-col-reverse sm:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-[10px] pb-1">
          <div
            className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto"
            role="listbox"
            aria-label="候補"
          >
            {matches.map(({ item, positions }, index) => {
              const active = item === selected
              return (
                <div
                  key={item.id}
                  ref={active ? selectedRef : undefined}
                  role="option"
                  aria-selected={active}
                  className={`cli-line flex cursor-pointer ${active ? 'cli-finder-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setCursor(index)}
                  onDoubleClick={() => onSelect(item, 'less')}
                >
                  <span className="ansi-1 ansi-bold w-[2ch] shrink-0">
                    {active ? '>' : ' '}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <Highlighted
                      text={finderLine(item)}
                      positions={positions}
                    />
                  </span>
                </div>
              )
            })}
          </div>
          <div className="cli-line ansi-3 flex gap-2 overflow-hidden">
            <span className="shrink-0">
              {'  '}
              {matches.length}/{books.length}
            </span>
            <span
              className="ansi-0 overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              {'─'.repeat(200)}
            </span>
          </div>
          <div className="cli-line relative">
            <span className="ansi-4 ansi-bold">{'> '}</span>
            <span aria-hidden="true">
              {query}
              <span className="cli-cursor cli-cursor-blink"> </span>
            </span>
            <input
              ref={inputRef}
              value={query}
              aria-label="lk: 検索語"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="cli-input-capture"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
        <div
          ref={previewRef}
          className="cli-finder-preview min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-1"
          role="document"
          aria-label="プレビュー"
        >
          {selected ? (
            <>
              <p className="cli-line ansi-b7 ansi-bold">
                {sanitize(selected.title)}
              </p>
              <p className="cli-line ansi-b0">
                {[
                  selected.author,
                  selected.category || '未分類',
                  selected.month,
                  selected.impression,
                ]
                  .map(sanitize)
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="cli-line"> </p>
              <p className="cli-line">
                {sanitize(selected.memo) || (
                  <span className="ansi-b0">(メモはありません)</span>
                )}
              </p>
            </>
          ) : (
            <p className="cli-line ansi-b0">(一致する本はありません)</p>
          )}
        </div>
      </div>
      <div className="cli-pager-status ansi-b0 hidden truncate sm:block">
        Enter less · Ctrl-E vim · ↑↓ 選択 · Shift-↑↓ プレビュー · Esc 終了
      </div>
      <div className="cli-keybar" aria-label="lkの補助キー">
        {(
          [
            ['↑', () => move(1)],
            ['↓', () => move(-1)],
            ['less', () => choose('less')],
            ['vim', () => choose('vim')],
            ['Esc', onCancel],
          ] as Array<[string, () => void]>
        ).map(([label, action]) => (
          <button
            key={label}
            type="button"
            className="cli-key"
            onMouseDown={(event) => event.preventDefault()}
            onClick={action}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
