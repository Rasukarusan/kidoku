import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Book } from '@/types/book'
import { NO_IMAGE } from '@/libs/constants'

interface Props {
  book: Book
  onQuit: () => void
  onOpen: (href: string) => void
}

/** less 風のページャー。書影とMarkdownのメモ（画像含む）はそのまま表示する */
export function LessPager({ book, onQuit, onOpen }: Props) {
  const viewRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState('')

  const updatePosition = () => {
    const view = viewRef.current
    if (!view) return
    const max = view.scrollHeight - view.clientHeight
    setPosition(
      max <= 1 || view.scrollTop >= max - 1
        ? '(END)'
        : `${Math.round(((view.scrollTop + view.clientHeight) / view.scrollHeight) * 100)}%`
    )
  }

  useEffect(() => {
    viewRef.current?.focus({ preventScroll: true })
    viewRef.current?.scrollTo({ top: 0 })
    updatePosition()
  }, [book])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const view = event.currentTarget
    const page = view.clientHeight * 0.9
    const line = 24
    const scroll: Record<string, number> = {
      j: line,
      ArrowDown: line,
      Enter: line,
      k: -line,
      ArrowUp: -line,
      ' ': page,
      f: page,
      PageDown: page,
      b: -page,
      PageUp: -page,
      d: page / 2,
      u: -page / 2,
    }
    if (event.key === 'q' || event.key === 'Escape') onQuit()
    else if (event.key === 'o') onOpen(`/books/${book.id}`)
    else if (event.key === 'g' || event.key === 'Home') view.scrollTop = 0
    else if (event.key === 'G' || event.key === 'End')
      view.scrollTop = view.scrollHeight
    else if (event.key in scroll) view.scrollBy({ top: scroll[event.key] })
    else return
    event.preventDefault()
  }

  return (
    <div className="cli-pager absolute inset-0 flex flex-col">
      <div
        ref={viewRef}
        role="document"
        tabIndex={0}
        aria-label={`less: ${book.title}`}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2 outline-none sm:px-4"
        onKeyDown={onKeyDown}
        onScroll={updatePosition}
      >
        <img
          className="mb-3 max-h-60 max-w-full object-contain"
          src={book.image && book.image !== '-' ? book.image : NO_IMAGE}
          alt={book.title}
          onLoad={updatePosition}
        />
        <p className="ansi-bold ansi-b7">{book.title}</p>
        <p className="ansi-b0 mb-4">
          {[book.author, book.category || '未分類', book.month, book.impression]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="cli-memo break-words">
          <ReactMarkdown>{book.memo || '(メモはありません)'}</ReactMarkdown>
        </div>
        <p className="ansi-b0 mt-4">~</p>
      </div>
      <div className="cli-pager-status flex items-center gap-3">
        <span className="ansi-inverse truncate px-1">
          {book.title} {position}
        </span>
        <span className="ansi-b0 ml-auto hidden shrink-0 sm:inline">
          j/k scroll · space/b page · g/G top/end · o open · q quit
        </span>
        <button
          type="button"
          className="cli-key ml-auto shrink-0 sm:ml-0"
          onClick={() => onOpen(`/books/${book.id}`)}
        >
          o:詳細
        </button>
        <button type="button" className="cli-key shrink-0" onClick={onQuit}>
          q:閉じる
        </button>
      </div>
    </div>
  )
}
