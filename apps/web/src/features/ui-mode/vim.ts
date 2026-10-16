// vim 風エディタの状態遷移。キー入力を1つずつ受け取り、新しい状態と実行すべき操作を返す。
// 列位置はサロゲートペアを考慮してコードポイント単位で扱う。

export type VimMode = 'normal' | 'insert' | 'command'
export type VimAction = 'write' | 'quit' | 'writequit' | null

interface Snapshot {
  lines: string[]
  row: number
  col: number
}

export interface VimState {
  lines: string[]
  row: number
  col: number
  mode: VimMode
  /** コマンドライン（: または / で始まる）の入力中の文字列 */
  command: string
  /** dd, gg などの途中まで入力されたキー */
  pending: string
  count: string
  register: { text: string[]; linewise: boolean } | null
  undo: Snapshot[]
  redo: Snapshot[]
  search: string
  message: string
  error: boolean
  dirty: boolean
  number: boolean
}

export interface VimResult {
  state: VimState
  action: VimAction
  force?: boolean
}

const HALF_PAGE = 10
const chars = (line: string) => Array.from(line)
const length = (line: string) => chars(line).length

export function createVimState(content: string, message = ''): VimState {
  return {
    lines: content.replace(/\r\n?/g, '\n').split('\n'),
    row: 0,
    col: 0,
    mode: 'normal',
    command: '',
    pending: '',
    count: '',
    register: null,
    undo: [],
    redo: [],
    search: '',
    message,
    error: false,
    dirty: false,
    number: false,
  }
}

export const vimContent = (state: VimState) => state.lines.join('\n')

const clamp = (state: VimState): VimState => {
  const row = Math.max(0, Math.min(state.row, state.lines.length - 1))
  const max = length(state.lines[row]) - (state.mode === 'insert' ? 0 : 1)
  return { ...state, row, col: Math.max(0, Math.min(state.col, max)) }
}

/** 変更前の状態を undo 履歴に積む */
const checkpoint = (state: VimState): VimState => ({
  ...state,
  undo: [
    ...state.undo.slice(-99),
    { lines: state.lines, row: state.row, col: state.col },
  ],
  redo: [],
  dirty: true,
})

const setLine = (state: VimState, row: number, line: string): VimState => ({
  ...state,
  lines: state.lines.map((value, index) => (index === row ? line : value)),
})

const firstNonBlank = (line: string) =>
  Math.max(
    0,
    chars(line).findIndex((char) => !/\s/.test(char))
  )

const kind = (char: string | undefined) =>
  char === undefined || /\s/.test(char)
    ? 0
    : /[\p{L}\p{N}_]/u.test(char)
      ? 1
      : 2

/** w: 次の単語の先頭へ */
function nextWord(state: VimState): VimState {
  let { row, col } = state
  const line = chars(state.lines[row])
  const start = kind(line[col])
  while (col < line.length && kind(line[col]) === start && start !== 0) col++
  while (col < line.length && kind(line[col]) === 0) col++
  if (col < line.length || row === state.lines.length - 1)
    return { ...state, col }
  row++
  return { ...state, row, col: firstNonBlank(state.lines[row]) }
}

/** b: 前の単語の先頭へ */
function previousWord(state: VimState): VimState {
  let { row, col } = state
  let line = chars(state.lines[row])
  if (col === 0 && row > 0) {
    row--
    line = chars(state.lines[row])
    col = line.length
  }
  col--
  while (col > 0 && kind(line[col]) === 0) col--
  const target = kind(line[col])
  while (col > 0 && kind(line[col - 1]) === target && target !== 0) col--
  return { ...state, row, col: Math.max(0, col) }
}

const insertAt = (state: VimState, text: string): VimState => {
  const parts = text.replace(/\r\n?/g, '\n').split('\n')
  const line = chars(state.lines[state.row])
  const before = line.slice(0, state.col).join('')
  const after = line.slice(state.col).join('')
  const inserted =
    parts.length === 1
      ? [before + parts[0] + after]
      : [
          before + parts[0],
          ...parts.slice(1, -1),
          parts[parts.length - 1] + after,
        ]
  return {
    ...state,
    lines: [
      ...state.lines.slice(0, state.row),
      ...inserted,
      ...state.lines.slice(state.row + 1),
    ],
    row: state.row + parts.length - 1,
    col:
      parts.length === 1
        ? state.col + length(parts[0])
        : length(parts[parts.length - 1]),
    dirty: true,
  }
}

/** 挿入モードで文字列（IMEの確定文字やペースト）を挿入する */
export function vimInsertText(state: VimState, text: string): VimState {
  if (state.mode !== 'insert' || !text) return state
  return insertAt(state, text)
}

const enterInsert = (state: VimState, col: number): VimState => ({
  ...checkpoint(state),
  mode: 'insert',
  col,
  message: '',
  error: false,
  dirty: state.dirty,
})

function deleteLines(state: VimState, count: number, yankOnly = false) {
  const end = Math.min(state.lines.length, state.row + count)
  const text = state.lines.slice(state.row, end)
  const register = { text, linewise: true }
  if (yankOnly) return { ...state, register }
  const lines = [...state.lines.slice(0, state.row), ...state.lines.slice(end)]
  return clamp({
    ...checkpoint(state),
    register,
    lines: lines.length ? lines : [''],
    col: 0,
  })
}

function deleteRange(state: VimState, from: number, to: number) {
  const line = chars(state.lines[state.row])
  if (from >= to || from >= line.length) return state
  return clamp({
    ...setLine(
      checkpoint(state),
      state.row,
      [...line.slice(0, from), ...line.slice(to)].join('')
    ),
    register: { text: [line.slice(from, to).join('')], linewise: false },
    col: from,
  })
}

/** dw の終端（次の単語の先頭。行末を越えない） */
const wordEnd = (state: VimState) => {
  const moved = nextWord(state)
  return moved.row === state.row ? moved.col : length(state.lines[state.row])
}

/** cw / de の終端（単語の直後。後ろの空白は含めない） */
const wordTail = (state: VimState) => {
  const line = chars(state.lines[state.row])
  const start = kind(line[state.col])
  let col = state.col
  while (col < line.length && kind(line[col]) === start && start !== 0) col++
  return start === 0 ? wordEnd(state) : col
}

function put(state: VimState, before: boolean): VimState {
  const register = state.register
  if (!register) return state
  const next = checkpoint(state)
  if (register.linewise) {
    const at = before ? state.row : state.row + 1
    return {
      ...next,
      lines: [
        ...state.lines.slice(0, at),
        ...register.text,
        ...state.lines.slice(at),
      ],
      row: at,
      col: firstNonBlank(register.text[0] ?? ''),
    }
  }
  const col = before || !state.lines[state.row] ? state.col : state.col + 1
  const inserted = insertAt({ ...next, col }, register.text.join('\n'))
  return clamp({ ...inserted, col: Math.max(col, inserted.col - 1) })
}

function find(state: VimState, pattern: string, backward = false): VimState {
  if (!pattern)
    return {
      ...state,
      message: 'E35: No previous regular expression',
      error: true,
    }
  const total = state.lines.length
  for (let step = 0; step <= total; step++) {
    const row = (state.row + (backward ? -step : step) + total * 2) % total
    const line = state.lines[row]
    let index: number
    if (step === 0) {
      const head = chars(line)
      const before = head.slice(0, state.col).join('').length
      index = backward
        ? before === 0
          ? -1
          : line.lastIndexOf(pattern, before - 1)
        : line.indexOf(pattern, head.slice(0, state.col + 1).join('').length)
    } else index = backward ? line.lastIndexOf(pattern) : line.indexOf(pattern)
    if (index !== -1)
      return {
        ...state,
        row,
        col: length(line.slice(0, index)),
        search: pattern,
        message: `${backward ? '?' : '/'}${pattern}`,
        error: false,
      }
  }
  return {
    ...state,
    search: pattern,
    message: `E486: Pattern not found: ${pattern}`,
    error: true,
  }
}

function runExCommand(state: VimState): VimResult {
  const raw = state.command
  const base = { ...state, mode: 'normal' as const, command: '' }
  if (raw.startsWith('/'))
    return { state: clamp(find(base, raw.slice(1))), action: null }
  const input = raw.slice(1).trim()
  const force = input.endsWith('!')
  const name = force ? input.slice(0, -1).trim() : input
  if (!name) return { state: base, action: null }
  if (/^\d+$/.test(name))
    return { state: clamp({ ...base, row: Number(name) - 1 }), action: null }
  if (name === '$')
    return {
      state: clamp({ ...base, row: base.lines.length - 1 }),
      action: null,
    }
  switch (name) {
    case 'w':
    case 'write':
      return { state: base, action: 'write', force }
    case 'q':
    case 'quit':
      if (base.dirty && !force)
        return {
          state: {
            ...base,
            message: 'E37: No write since last change (add ! to override)',
            error: true,
          },
          action: null,
        }
      return { state: base, action: 'quit' }
    case 'wq':
    case 'x':
    case 'xit':
      return { state: base, action: 'writequit', force }
    case 'set nu':
    case 'set number':
      return { state: { ...base, number: true }, action: null }
    case 'set nonu':
    case 'set nonumber':
      return { state: { ...base, number: false }, action: null }
    case 'set nu!':
      return { state: { ...base, number: !base.number }, action: null }
    case 'noh':
    case 'nohlsearch':
      return { state: base, action: null }
    case 'h':
    case 'help':
      return {
        state: {
          ...base,
          message:
            ':w 保存  :q 終了  :wq 保存して終了  :q! 破棄して終了  i 挿入  Esc ノーマル',
        },
        action: null,
      }
    default:
      return {
        state: {
          ...base,
          message: `E492: Not an editor command: ${input}`,
          error: true,
        },
        action: null,
      }
  }
}

function insertKey(state: VimState, key: string): VimResult {
  const line = chars(state.lines[state.row])
  const result = (next: VimState): VimResult => ({ state: next, action: null })
  switch (key) {
    case 'Escape':
    case 'C-c':
    case 'C-[':
      return result(clamp({ ...state, mode: 'normal', col: state.col - 1 }))
    case 'Enter':
      return result(insertAt(state, '\n'))
    case 'Tab':
      return result(insertAt(state, '  '))
    case 'Backspace': {
      if (state.col > 0)
        return result({
          ...setLine(
            state,
            state.row,
            [...line.slice(0, state.col - 1), ...line.slice(state.col)].join('')
          ),
          col: state.col - 1,
          dirty: true,
        })
      if (state.row === 0) return result(state)
      const previous = state.lines[state.row - 1]
      return result({
        ...state,
        lines: [
          ...state.lines.slice(0, state.row - 1),
          previous + state.lines[state.row],
          ...state.lines.slice(state.row + 1),
        ],
        row: state.row - 1,
        col: length(previous),
        dirty: true,
      })
    }
    case 'Delete':
      if (state.col < line.length)
        return result({
          ...setLine(
            state,
            state.row,
            [...line.slice(0, state.col), ...line.slice(state.col + 1)].join('')
          ),
          dirty: true,
        })
      if (state.row === state.lines.length - 1) return result(state)
      return result({
        ...state,
        lines: [
          ...state.lines.slice(0, state.row),
          state.lines[state.row] + state.lines[state.row + 1],
          ...state.lines.slice(state.row + 2),
        ],
        dirty: true,
      })
    case 'C-u':
      return result({
        ...setLine(state, state.row, line.slice(state.col).join('')),
        col: 0,
        dirty: true,
      })
    case 'C-w': {
      const head = line
        .slice(0, state.col)
        .join('')
        .replace(/\S+\s*$|\s+$/, '')
      return result({
        ...setLine(state, state.row, head + line.slice(state.col).join('')),
        col: length(head),
        dirty: true,
      })
    }
    case 'ArrowLeft':
      return result(clamp({ ...state, col: state.col - 1 }))
    case 'ArrowRight':
      return result(clamp({ ...state, col: state.col + 1 }))
    case 'ArrowUp':
      return result(clamp({ ...state, row: state.row - 1 }))
    case 'ArrowDown':
      return result(clamp({ ...state, row: state.row + 1 }))
    case 'Home':
      return result({ ...state, col: 0 })
    case 'End':
      return result({ ...state, col: line.length })
    default:
      return result(Array.from(key).length === 1 ? insertAt(state, key) : state)
  }
}

function commandKey(state: VimState, key: string): VimResult {
  const result = (next: VimState): VimResult => ({ state: next, action: null })
  switch (key) {
    case 'Escape':
    case 'C-c':
    case 'C-[':
      return result({ ...state, mode: 'normal', command: '' })
    case 'Enter':
      return runExCommand(state)
    case 'Backspace':
      return result(
        state.command.length <= 1
          ? { ...state, mode: 'normal', command: '' }
          : { ...state, command: chars(state.command).slice(0, -1).join('') }
      )
    case 'C-u':
      return result({ ...state, command: state.command[0] })
    default:
      return result(
        Array.from(key).length === 1
          ? { ...state, command: state.command + key }
          : state
      )
  }
}

function normalKey(input: VimState, key: string): VimResult {
  const state = {
    ...input,
    message: input.pending ? input.message : '',
    error: false,
  }
  const result = (next: VimState, action: VimAction = null): VimResult => ({
    state: clamp({ ...next, pending: '', count: '' }),
    action,
  })
  if (/^[1-9]$/.test(key) || (key === '0' && state.count)) {
    if (!state.pending || /^[dcy]$/.test(state.pending))
      return { state: { ...state, count: state.count + key }, action: null }
  }
  const count = Math.max(1, Number(state.count) || 1)
  const line = chars(state.lines[state.row])
  if (key === 'Escape' || key === 'C-c' || key === 'C-[') return result(state)

  // 2打鍵目が必要なコマンド
  switch (state.pending) {
    case 'g':
      return result(
        key === 'g'
          ? { ...state, row: state.count ? count - 1 : 0, col: 0 }
          : state
      )
    case 'r': {
      if (Array.from(key).length !== 1 || !line.length) return result(state)
      const next = checkpoint(state)
      return result(
        setLine(
          next,
          state.row,
          [...line.slice(0, state.col), key, ...line.slice(state.col + 1)].join(
            ''
          )
        )
      )
    }
    case 'Z':
      if (key === 'Z') return result(state, 'writequit')
      if (key === 'Q') return { ...result(state, 'quit'), force: true }
      return result(state)
    case 'd':
    case 'c':
    case 'y': {
      const operator = state.pending
      let next: VimState = state
      if (key === operator) {
        if (operator !== 'c')
          return result(deleteLines(state, count, operator === 'y'))
        const end = Math.min(state.lines.length, state.row + count)
        return result({
          ...checkpoint(state),
          register: { text: state.lines.slice(state.row, end), linewise: true },
          lines: [
            ...state.lines.slice(0, state.row),
            '',
            ...state.lines.slice(end),
          ],
          mode: 'insert',
          col: 0,
        })
      }
      const to =
        key === 'e' || (key === 'w' && operator === 'c')
          ? wordTail(state)
          : key === 'w'
            ? wordEnd(state)
            : key === '$'
              ? line.length
              : key === '0'
                ? 0
                : null
      if (to === null) return result(state)
      const from = Math.min(state.col, to)
      const end = Math.max(state.col, to)
      if (operator === 'y')
        return result({
          ...state,
          register: { text: [line.slice(from, end).join('')], linewise: false },
        })
      next = deleteRange(state, from, end)
      if (operator === 'c')
        return result({ ...next, mode: 'insert', col: from })
      return result(next)
    }
  }

  switch (key) {
    case 'h':
    case 'ArrowLeft':
    case 'Backspace':
      return result({ ...state, col: state.col - count })
    case 'l':
    case 'ArrowRight':
    case ' ':
      return result({ ...state, col: state.col + count })
    case 'j':
    case 'ArrowDown':
    case 'C-n':
      return result({ ...state, row: state.row + count })
    case 'k':
    case 'ArrowUp':
    case 'C-p':
      return result({ ...state, row: state.row - count })
    case 'Enter':
    case '+':
      return result({
        ...state,
        row: state.row + count,
        col: firstNonBlank(
          state.lines[Math.min(state.row + count, state.lines.length - 1)]
        ),
      })
    case '-':
      return result({
        ...state,
        row: state.row - count,
        col: firstNonBlank(state.lines[Math.max(state.row - count, 0)]),
      })
    case '0':
    case 'Home':
      return result({ ...state, col: 0 })
    case '^':
      return result({ ...state, col: firstNonBlank(state.lines[state.row]) })
    case '$':
    case 'End':
      return result({ ...state, col: line.length })
    case 'w':
    case 'W': {
      let next = state
      for (let i = 0; i < count; i++) next = nextWord(next)
      return result(next)
    }
    case 'b':
    case 'B': {
      let next = state
      for (let i = 0; i < count; i++) next = previousWord(next)
      return result(next)
    }
    case 'G':
      return result({
        ...state,
        row: state.count ? count - 1 : state.lines.length - 1,
        col: 0,
      })
    case 'C-d':
      return result({ ...state, row: state.row + HALF_PAGE })
    case 'C-u':
      return result({ ...state, row: state.row - HALF_PAGE })
    case 'C-f':
    case 'PageDown':
      return result({ ...state, row: state.row + HALF_PAGE * 2 })
    case 'C-b':
    case 'PageUp':
      return result({ ...state, row: state.row - HALF_PAGE * 2 })
    case 'i':
    case 'Insert':
      return result(enterInsert(state, state.col))
    case 'a':
      return result(enterInsert(state, line.length ? state.col + 1 : 0))
    case 'I':
      return result(enterInsert(state, firstNonBlank(state.lines[state.row])))
    case 'A':
      return result(enterInsert(state, line.length))
    case 'o':
    case 'O': {
      const at = key === 'o' ? state.row + 1 : state.row
      const next = enterInsert(state, 0)
      return result({
        ...next,
        lines: [...state.lines.slice(0, at), '', ...state.lines.slice(at)],
        row: at,
        dirty: true,
      })
    }
    case 'x':
    case 'Delete':
      return result(deleteRange(state, state.col, state.col + count))
    case 'X':
      return result(
        deleteRange(state, Math.max(0, state.col - count), state.col)
      )
    case 'D':
      return result(deleteRange(state, state.col, line.length))
    case 'C':
      return result({
        ...deleteRange(state, state.col, line.length),
        mode: 'insert',
        col: state.col,
      })
    case 's': {
      const next = line.length
        ? deleteRange(state, state.col, state.col + count)
        : checkpoint(state)
      return result({ ...next, mode: 'insert', col: state.col })
    }
    case 'S':
      return result({
        ...setLine(checkpoint(state), state.row, ''),
        mode: 'insert',
        col: 0,
      })
    case 'Y':
      return result(deleteLines(state, count, true))
    case 'p':
    case 'P':
      return result(put(state, key === 'P'))
    case 'J': {
      if (state.row >= state.lines.length - 1) return result(state)
      const next = checkpoint(state)
      const joined = `${state.lines[state.row].replace(/\s+$/, '')} ${state.lines[state.row + 1].trimStart()}`
      return result({
        ...next,
        lines: [
          ...state.lines.slice(0, state.row),
          joined,
          ...state.lines.slice(state.row + 2),
        ],
        col: length(state.lines[state.row].replace(/\s+$/, '')),
      })
    }
    case '~': {
      if (!line.length) return result(state)
      const char = line[state.col]
      const toggled =
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      return result({
        ...setLine(
          checkpoint(state),
          state.row,
          [
            ...line.slice(0, state.col),
            toggled,
            ...line.slice(state.col + 1),
          ].join('')
        ),
        col: state.col + 1,
      })
    }
    case 'u': {
      const previous = state.undo[state.undo.length - 1]
      if (!previous)
        return result({ ...state, message: 'Already at oldest change' })
      return result({
        ...state,
        ...previous,
        undo: state.undo.slice(0, -1),
        redo: [
          ...state.redo,
          { lines: state.lines, row: state.row, col: state.col },
        ],
        dirty: true,
        message: '1 change; before #' + state.undo.length,
      })
    }
    case 'C-r': {
      const next = state.redo[state.redo.length - 1]
      if (!next)
        return result({ ...state, message: 'Already at newest change' })
      return result({
        ...state,
        ...next,
        redo: state.redo.slice(0, -1),
        undo: [
          ...state.undo,
          { lines: state.lines, row: state.row, col: state.col },
        ],
        dirty: true,
      })
    }
    case 'n':
    case 'N':
      return result(find(state, state.search, key === 'N'))
    case ':':
    case '/':
      return result({ ...state, mode: 'command', command: key })
    case 'g':
    case 'd':
    case 'c':
    case 'y':
    case 'r':
    case 'Z':
      return { state: { ...state, pending: key }, action: null }
    default:
      return result(state)
  }
}

export function vimKey(state: VimState, key: string): VimResult {
  if (state.mode === 'insert') return insertKey(state, key)
  if (state.mode === 'command') return commandKey(state, key)
  return normalKey(state, key)
}

/** 複数キーをまとめて入力する（テストや補助キー用） */
export function vimKeys(state: VimState, keys: string[]): VimResult {
  let result: VimResult = { state, action: null }
  for (const key of keys) {
    result = vimKey(result.state, key)
    if (result.action) break
  }
  return result
}
