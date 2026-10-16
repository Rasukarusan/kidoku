import { useEffect, useRef, useState } from 'react'
import { EditorFile } from './commands'
import {
  createVimState,
  vimContent,
  vimInsertText,
  vimKey,
  VimState,
} from './vim'

export interface WriteResult {
  ok: boolean
  message: string
}

interface Props {
  file: EditorFile
  onWrite: (content: string, force: boolean) => Promise<WriteResult>
  onQuit: () => void
}

const NAMED_KEYS = [
  'Escape',
  'Enter',
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Insert',
]

/** UTF-8 でのバイト数（:w のメッセージ用） */
export const byteLength = (text: string) =>
  Array.from(text).reduce((total, char) => {
    const code = char.codePointAt(0) ?? 0
    return total + (code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4)
  }, 0)

const openMessage = (file: EditorFile) => {
  if (!file.name) return ''
  if (file.isNew) return `"${file.name}" [New]`
  const lines = file.content.split('\n').length
  return `"${file.name}"${file.readonly ? ' [readonly]' : ''} ${lines}L, ${byteLength(file.content)}B`
}

/** モバイル向けの補助キー（ラベルと送るキー列） */
const TOUCH_KEYS: Array<[string, string[]]> = [
  ['Esc', ['Escape']],
  ['i', ['i']],
  ['a', ['a']],
  ['o', ['o']],
  ['←', ['ArrowLeft']],
  ['↓', ['ArrowDown']],
  ['↑', ['ArrowUp']],
  ['→', ['ArrowRight']],
  ['x', ['x']],
  ['dd', ['d', 'd']],
  ['u', ['u']],
  [':w', ['Escape', ':', 'w', 'Enter']],
  [':q', ['Escape', ':', 'q', 'Enter']],
  [':wq', ['Escape', ':', 'w', 'q', 'Enter']],
]

export function VimEditor({ file, onWrite, onQuit }: Props) {
  const [state, setState] = useState<VimState>(() =>
    createVimState(file.content, openMessage(file))
  )
  const stateRef = useRef(state)
  const [composing, setComposing] = useState('')
  const [position, setPosition] = useState('All')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bufferRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  const commit = (next: VimState) => {
    stateRef.current = next
    setState(next)
  }

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    cursorRef.current?.scrollIntoView?.({ block: 'nearest' })
    const buffer = bufferRef.current
    if (!buffer) return
    const max = buffer.scrollHeight - buffer.clientHeight
    setPosition(
      max <= 1
        ? 'All'
        : buffer.scrollTop <= 0
          ? 'Top'
          : buffer.scrollTop >= max - 1
            ? 'Bot'
            : `${Math.round((buffer.scrollTop / max) * 100)}%`
    )
  }, [state])

  const writing = useRef(false)

  const write = async (quit: boolean, force: boolean) => {
    writing.current = true
    commit({
      ...stateRef.current,
      message: `"${file.name || '[No Name]'}" writing...`,
      error: false,
    })
    const result = await onWrite(vimContent(stateRef.current), force).finally(
      () => {
        writing.current = false
      }
    )
    commit({
      ...stateRef.current,
      dirty: result.ok ? false : stateRef.current.dirty,
      message: result.message,
      error: !result.ok,
    })
    if (result.ok && quit) onQuit()
  }

  const press = (keys: string[]) => {
    // 保存中の入力でバッファが変わらないようにする
    if (writing.current) return
    for (const key of keys) {
      const {
        state: next,
        action,
        force = false,
      } = vimKey(stateRef.current, key)
      commit(next)
      if (action === 'quit') return onQuit()
      if (action === 'write') return void write(false, force)
      if (action === 'writequit')
        return next.dirty || force ? void write(true, force) : onQuit()
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IMEの変換中は compositionend で確定文字を受け取る
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.metaKey || event.altKey) return
    let key = event.key
    if (event.ctrlKey) {
      if (key.length !== 1) return
      key = `C-${key.toLowerCase()}`
    } else if (key.length !== 1 && !NAMED_KEYS.includes(key)) return
    event.preventDefault()
    press([key])
  }

  // キーイベントで拾えない入力（ソフトウェアキーボードなど）を処理する
  const onInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value
    if ((event.nativeEvent as InputEvent).isComposing) {
      setComposing(value)
      return
    }
    event.currentTarget.value = ''
    setComposing('')
    if (!value) return
    if (stateRef.current.mode === 'insert')
      commit(vimInsertText(stateRef.current, value))
    else
      press(Array.from(value).map((char) => (char === '\n' ? 'Enter' : char)))
  }

  const onCompositionEnd = (
    event: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    const value = event.currentTarget.value
    event.currentTarget.value = ''
    setComposing('')
    if (value && stateRef.current.mode === 'insert')
      commit(vimInsertText(stateRef.current, value))
  }

  const gutter = String(state.lines.length).length + 1
  const insert = state.mode === 'insert'

  return (
    <div
      className="cli-vim absolute inset-0 flex flex-col"
      onMouseUp={() => {
        if (!window.getSelection()?.toString())
          inputRef.current?.focus({ preventScroll: true })
      }}
    >
      <textarea
        ref={inputRef}
        aria-label={`vim: ${file.name || '[No Name]'}`}
        className="cli-input-capture"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={onKeyDown}
        onInput={onInput}
        onCompositionEnd={onCompositionEnd}
        onPaste={(event) => {
          event.preventDefault()
          commit(
            vimInsertText(
              stateRef.current,
              event.clipboardData.getData('text/plain')
            )
          )
        }}
      />
      <div
        ref={bufferRef}
        className="min-h-0 flex-1 overflow-y-auto px-[10px] pt-[6px]"
        role="document"
        aria-label="バッファ"
      >
        {state.lines.map((line, row) => {
          const cursorRow = row === state.row && state.mode !== 'command'
          const glyphs = Array.from(line)
          return (
            <div key={row} className="cli-line flex">
              {state.number && (
                <span
                  aria-hidden="true"
                  className="ansi-3 shrink-0 select-none pr-2 text-right"
                  style={{ width: `${gutter}ch` }}
                >
                  {row + 1}
                </span>
              )}
              <span className="min-w-0 flex-1">
                {cursorRow ? (
                  <>
                    {glyphs.slice(0, state.col).join('')}
                    {composing && (
                      <span className="ansi-underline">{composing}</span>
                    )}
                    <span
                      ref={cursorRef}
                      className={insert ? 'cli-cursor-bar' : 'cli-cursor'}
                    >
                      {glyphs[state.col] ?? ' '}
                    </span>
                    {glyphs.slice(state.col + 1).join('')}
                  </>
                ) : (
                  line
                )}
              </span>
            </div>
          )
        })}
        {Array.from({ length: 60 }, (_, index) => (
          <div
            key={`tilde-${index}`}
            className="cli-line ansi-4"
            aria-hidden="true"
          >
            ~
          </div>
        ))}
      </div>
      <div className="cli-vim-status flex gap-4">
        <span className="min-w-0 flex-1 truncate">
          {file.name || '[No Name]'}
          {state.dirty ? ' [+]' : ''}
          {file.readonly ? ' [RO]' : ''}
        </span>
        <span className="shrink-0">
          {state.row + 1},{state.col + 1}
        </span>
        <span className="w-8 shrink-0 text-right">{position}</span>
      </div>
      <div className="cli-line flex min-h-[1.5em] px-[10px]" role="status">
        {state.mode === 'command' ? (
          <span>
            {state.command}
            <span className="cli-cursor"> </span>
          </span>
        ) : state.message ? (
          <span className={state.error ? 'cli-vim-error' : ''}>
            {state.message}
          </span>
        ) : insert ? (
          <span className="ansi-bold">-- INSERT --</span>
        ) : null}
        {state.pending || state.count ? (
          <span className="ml-auto pr-12">
            {state.count}
            {state.pending}
          </span>
        ) : null}
      </div>
      <div className="cli-keybar" aria-label="vimの補助キー">
        {TOUCH_KEYS.map(([label, keys]) => (
          <button
            key={label}
            type="button"
            className="cli-key"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              press(keys)
              inputRef.current?.focus({ preventScroll: true })
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
