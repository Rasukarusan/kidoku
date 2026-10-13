import { Book } from '@/types/book'
import { UiMode } from './UiModeProvider'

export interface TerminalSheet {
  id: string
  name: string
  order: number
}
export type CommandResult =
  | { type: 'text'; text: string }
  | { type: 'cd'; sheet: string | null }
  | { type: 'less'; book: Book }
  | { type: 'mode'; mode: UiMode }
  | { type: 'clear' }

export const COMMAND_HELP = `help                 コマンド一覧
ai                   AI読書分析を表示
pwd                  現在の場所
ls                   シート／本の一覧（本はID付き）
tree                 シートと現在の本のツリー
cd <シート名>        シートに移動（空白を含む名前は引用符で囲む）
cd ..                シート一覧に戻る
less <本のID/題名>   書影・メモを読む（j/kでスクロール、qで閉じる）
open <本のID/題名>   lessと同じ
clear                履歴を消す
mode normal|terminal|cli  表示モードを切り替える
↑ / ↓                コマンド履歴
Tab                  コマンド・シート名・本のIDを補完`

export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = []
  let token = ''
  let quote = ''
  let started = false
  let escaped = false
  for (const char of input.trim()) {
    if (escaped) {
      token += char
      started = true
      escaped = false
    } else if (char === '\\' && quote !== "'") {
      escaped = true
      started = true
    } else if (quote) {
      if (char === quote) quote = ''
      else token += char
    } else if (char === '"' || char === "'") {
      quote = char
      started = true
    } else if (/\s/.test(char)) {
      if (started) tokens.push(token)
      token = ''
      started = false
    } else {
      token += char
      started = true
    }
  }
  if (quote) throw new Error('引用符を閉じてください。')
  if (escaped) throw new Error('バックスラッシュの後に文字を指定してください。')
  if (started) tokens.push(token)
  return tokens
}

export function runCommand(
  input: string,
  context: {
    username: string
    currentSheet: string | null
    sheets: TerminalSheet[]
    books: Book[]
  }
): CommandResult {
  const text = (value: string): CommandResult => ({ type: 'text', text: value })
  let tokens: string[]
  try {
    tokens = tokenizeCommand(input)
  } catch (error) {
    return text((error as Error).message)
  }
  const [command, ...args] = tokens
  const argument = args.join(' ')
  const { username, currentSheet, sheets, books } = context
  const root = `/${username}/sheets`
  const listing = books.map(
    (book) => `${book.id}  ${book.title} — ${book.author}`
  )
  if (!command) return text('')
  switch (command) {
    case 'help':
      return text(COMMAND_HELP)
    case 'pwd':
      return text(`${root}${currentSheet ? `/${currentSheet}` : ''}`)
    case 'ls':
      return text(
        currentSheet
          ? listing.join('\n') || '本はまだありません。'
          : sheets.map((sheet) => `${sheet.name}/`).join('\n') ||
              'シートはまだありません。'
      )
    case 'tree':
      return text(
        [
          `${root}/`,
          ...sheets.flatMap((sheet, index) => {
            const last = index === sheets.length - 1
            return [
              `${last ? '└──' : '├──'} ${sheet.name}/`,
              ...(sheet.name === currentSheet
                ? listing.map(
                    (book, i) =>
                      `${last ? '    ' : '│   '}${i === listing.length - 1 ? '└──' : '├──'} ${book}`
                  )
                : []),
            ]
          }),
        ].join('\n')
      )
    case 'cd': {
      if (!argument || ['..', '/', '~', root, `${root}/`].includes(argument))
        return { type: 'cd', sheet: null }
      if (argument === '.') return { type: 'cd', sheet: currentSheet }
      let name = argument
      if (name.startsWith(`${root}/`)) name = name.slice(root.length + 1)
      else name = name.replace(/^(\.\/|\.\.\/)/, '')
      if (name.endsWith('/')) name = name.slice(0, -1)
      const sheet = sheets.find((sheet) => sheet.name === name)
      return sheet
        ? { type: 'cd', sheet: sheet.name }
        : text(
            `シートが見つかりません: ${argument}\nls または tree で確認できます。`
          )
    }
    case 'less':
    case 'open': {
      if (!currentSheet)
        return text('先に cd <シート名> でシートに移動してください。')
      if (!argument) return text(`使い方: ${command} <本のID/題名>`)
      const byId = books.find((book) => String(book.id) === argument)
      const matches = books.filter((book) => book.title === argument)
      if (!byId && matches.length > 1)
        return text(
          '同じ題名の本があります。ls でIDを確認して指定してください。'
        )
      const book = byId || matches[0]
      return book
        ? { type: 'less', book }
        : text(`本が見つかりません: ${argument}`)
    }
    case 'clear':
      return { type: 'clear' }
    case 'mode':
      return ['normal', 'terminal', 'cli'].includes(argument)
        ? { type: 'mode', mode: argument as UiMode }
        : text('使い方: mode normal|terminal|cli')
    default:
      return text(
        `未対応のコマンド: ${command}\nhelp でコマンド一覧を表示します。`
      )
  }
}

export function completeCommand(
  input: string,
  sheets: TerminalSheet[],
  books: Book[]
): string[] {
  if (!input.includes(' '))
    return [
      'help',
      'ai',
      'pwd',
      'ls',
      'tree',
      'cd',
      'less',
      'open',
      'clear',
      'mode',
    ].filter((command) => command.startsWith(input))
  const separator = input.indexOf(' ')
  const command = input.slice(0, separator)
  const prefix = input.slice(separator + 1).replace(/^["']/, '')
  const values =
    command === 'cd'
      ? sheets.map((sheet) => sheet.name)
      : ['less', 'open'].includes(command)
        ? books.map((book) => String(book.id))
        : command === 'mode'
          ? ['normal', 'terminal', 'cli']
          : []
  return values
    .filter((value) => value.startsWith(prefix))
    .map((value) => `${command} ${JSON.stringify(value)}`)
}
