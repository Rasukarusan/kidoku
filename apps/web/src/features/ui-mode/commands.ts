import type { AiSummariesJson } from '@/features/sheet/components/AiSummaries/types'
import {
  AI_SUMMARY_FIELDS,
  AiSummaryFieldKey,
} from '@/features/sheet/components/AiSummaries/fields'
import { findPersonalityType } from '@/libs/ai/personality/personality-types'
import { Book } from '@/types/book'
import { ansi, displayWidth, padEnd, sanitize } from './ansi'
import { UiMode } from './UiModeProvider'

export const SHELL = 'kidoku'

export interface TerminalSheet {
  id: string
  name: string
  order: number
}
export type CommandResult =
  | { type: 'text'; text: string }
  | { type: 'cd'; sheet: string | null }
  | { type: 'less'; book: Book }
  | { type: 'open'; href: string; text: string }
  | { type: 'mode'; mode: UiMode; text: string }
  | { type: 'clear' }

export interface CommandContext {
  username: string
  currentSheet: string | null
  sheets: TerminalSheet[]
  books: Book[]
  history?: string[]
  aiSummary?: AiSummariesJson
}

const HELP: Array<[string, string]> = [
  ['help', 'コマンド一覧を表示'],
  ['ls [-l]', 'シート／本の一覧（-l で詳細表示）'],
  ['cd <sheet>', 'シートに移動（cd .. / cd でホームへ）'],
  ['pwd', '現在のディレクトリを表示'],
  ['tree', 'シートと本のツリーを表示'],
  ['less <id|title>', '書影とメモをページャーで読む'],
  ['cat <id|title>', 'メモをそのまま出力'],
  ['open <id|title>', '本の詳細・編集ページを開く'],
  ['grep <word>', '題名・著者・メモを検索'],
  ['stats', '月別・カテゴリ別の読書量'],
  ['ai', 'AI読書分析を表示'],
  ['neofetch', '読書プロフィールを表示'],
  ['history', 'コマンド履歴'],
  ['whoami / date / echo', ''],
  ['clear', '画面を消去（Ctrl+L）'],
  ['exit', 'CLIを終了して通常表示に戻る'],
]
const KEYS: Array<[string, string]> = [
  ['Tab', '補完（候補が複数なら一覧表示）'],
  ['↑ / ↓', 'コマンド履歴'],
  ['Ctrl+C', '入力を中断'],
  ['Ctrl+A / Ctrl+E', '行頭／行末へ移動'],
  ['Ctrl+U / Ctrl+W', '行頭まで／直前の単語を削除'],
]

export const COMMANDS = [
  'ai',
  'cat',
  'cd',
  'clear',
  'date',
  'echo',
  'exit',
  'grep',
  'help',
  'history',
  'less',
  'ls',
  'mode',
  'neofetch',
  'open',
  'pwd',
  'stats',
  'tree',
  'whoami',
]

export const helpText = () =>
  [
    `${ansi.bold(`${SHELL} shell`)} — 読書記録をコマンドで操作します`,
    '',
    ...HELP.map(([command, description]) =>
      `  ${ansi.green(padEnd(command, 20))}${description}`.trimEnd()
    ),
    '',
    ansi.bold('キー操作'),
    ...KEYS.map(
      ([key, description]) => `  ${ansi.yellow(padEnd(key, 20))}${description}`
    ),
  ].join('\n')

const K = [' _  __', '| |/ /', "| ' / ", '| . \\ ', '|_|\\_\\']
const I = [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|']
const D = [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ ']
const O = ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ ']
const U = [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ ']
export const BANNER = [0, 1, 2, 3, 4]
  .map((row) => [K, I, D, O, K, U].map((glyph) => glyph[row]).join(''))
  .join('\n')

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

/** 空白や引用符をバックスラッシュでエスケープし、1トークンとして解釈できるようにする */
export const escapeArgument = (value: string) =>
  value.replace(/([\s"'\\])/g, '\\$1')

const coverOf = (book: Book) => sanitize(book.title)

const findBook = (
  command: string,
  argument: string,
  books: Book[]
): Book | string => {
  if (!argument) return `${command}: 使い方: ${command} <本のID/題名>`
  const byId = books.find((book) => String(book.id) === argument)
  if (byId) return byId
  const matches = books.filter((book) => book.title === argument)
  if (matches.length > 1)
    return `${command}: ${argument}: 同じ題名の本があります。ls でIDを確認して指定してください。`
  return matches[0] || `${command}: ${argument}: 本が見つかりません`
}

const bar = (count: number, max: number, width = 30) =>
  ansi.green('█'.repeat(max ? Math.round((count / max) * width) : 0))

const countBy = (books: Book[], key: (book: Book) => string) =>
  Object.entries(
    books.reduce<Record<string, number>>((counts, book) => {
      const name = key(book)
      counts[name] = (counts[name] || 0) + 1
      return counts
    }, {})
  ).sort(([, a], [, b]) => b - a)

function stats(books: Book[], sheet: string) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = `${index + 1}月`
    return [month, books.filter((book) => book.month === month).length] as const
  })
  const monthMax = Math.max(0, ...months.map(([, count]) => count))
  const categories = countBy(
    books,
    (book) => sanitize(book.category) || '未分類'
  )
  const categoryMax = categories[0]?.[1] ?? 0
  const labelWidth = Math.max(
    0,
    ...categories.map(([name]) => displayWidth(name))
  )
  return [
    ansi.bold(`${sheet}: ${books.length}冊`),
    '',
    ansi.cyan('# monthly'),
    ...months.map(
      ([month, count]) =>
        `${month.padStart(3)} │${bar(count, monthMax)} ${ansi.gray(String(count))}`
    ),
    '',
    ansi.cyan('# categories'),
    ...(categories.length
      ? categories.map(
          ([name, count]) =>
            `${padEnd(name, labelWidth)} │${bar(count, categoryMax, 20)} ${ansi.gray(String(count))}`
        )
      : [ansi.gray('(empty)')]),
  ].join('\n')
}

function neofetch(context: CommandContext) {
  const { username, currentSheet, sheets, books } = context
  const logo = [
    '      ______ ______',
    '    _/      Y      \\_',
    '   // ~~ ~~ | ~~ ~  \\\\',
    '  // ~ ~ ~~ | ~~~ ~~ \\\\',
    ' //________.|.________\\\\',
    "'----------'-'----------'",
  ]
  const top = countBy(books, (book) => sanitize(book.category) || '未分類')[0]
  const favorites = books.filter((book) => book.impression === '◎').length
  const title = `${username}@${SHELL}`
  const info = [
    ansi.bold(ansi.cyan(title)),
    '-'.repeat(title.length),
    `${ansi.bold(ansi.cyan('Shell'))}: ${SHELL}`,
    `${ansi.bold(ansi.cyan('Sheet'))}: ${sanitize(currentSheet ?? '~')}`,
    `${ansi.bold(ansi.cyan('Sheets'))}: ${sheets.length}`,
    `${ansi.bold(ansi.cyan('Books'))}: ${books.length}`,
    `${ansi.bold(ansi.cyan('Favorites'))}: ${favorites} (◎)`,
    `${ansi.bold(ansi.cyan('Top category'))}: ${top ? `${top[0]} (${top[1]})` : '-'}`,
    `${ansi.bold(ansi.cyan('Latest'))}: ${books.length ? coverOf(books[books.length - 1]) : '-'}`,
    '',
    [0, 1, 2, 3, 4, 5, 6, 7].map((code) => `\x1b[3${code}m███`).join('') +
      '\x1b[39m',
  ]
  return Array.from({ length: Math.max(logo.length, info.length) }, (_, i) =>
    `${ansi.cyan((logo[i] ?? '').padEnd(26))}${info[i] ?? ''}`.trimEnd()
  ).join('\n')
}

function aiAnalysis(aiSummary?: AiSummariesJson) {
  if (!aiSummary)
    return `ai: AI分析はまだありません。exit で通常表示に戻り、AI分析を生成できます。`
  const personality = findPersonalityType(aiSummary.personality_type)
  const heading = personality
    ? [
        ansi.magenta(
          [
            '    .--------.',
            '    | o  o   |',
            '    |   __   |',
            "    '--------'",
            '    +----+----+',
            '    |    |    |',
            '    +----+----+',
          ].join('\n')
        ),
        '',
        ansi.bold(
          ansi.magenta(`[ ${personality.code} / ${personality.name} ]`)
        ),
        personality.tagline,
        '',
        '',
      ].join('\n')
    : ''
  const analysis = Object.entries(AI_SUMMARY_FIELDS)
    .filter(([key]) => key !== 'character_summary')
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) =>
      aiSummary[key as AiSummaryFieldKey]
        ? `${ansi.bold(ansi.cyan(`## ${AI_SUMMARY_FIELDS[key as AiSummaryFieldKey].title}`))}\n${sanitize(aiSummary[key as AiSummaryFieldKey] as string)}`
        : ''
    )
    .filter(Boolean)
    .join('\n\n')
  return (
    heading +
    (aiSummary.character_summary
      ? `${sanitize(aiSummary.character_summary)}\n\n`
      : '') +
    analysis
  )
}

export function runCommand(
  input: string,
  context: CommandContext
): CommandResult {
  const text = (value: string): CommandResult => ({ type: 'text', text: value })
  let tokens: string[]
  try {
    tokens = tokenizeCommand(input)
  } catch (error) {
    return text(`${SHELL}: ${(error as Error).message}`)
  }
  const [command, ...rest] = tokens
  const flags = rest.filter((arg) => /^-\w+$/.test(arg))
  const args = rest.filter((arg) => !/^-\w+$/.test(arg))
  const argument = args.join(' ')
  const { username, currentSheet, sheets, books } = context
  const root = `/${username}/sheets`
  const id = (book: Book, width = 0) =>
    ansi.yellow(String(book.id).padStart(width))
  const idWidth = Math.max(0, ...books.map((book) => String(book.id).length))
  const name = (book: Book) =>
    `${ansi.bold(sanitize(book.title))} ${ansi.gray(`— ${sanitize(book.author)}`)}`
  const listing = books.map((book) => `${id(book, idWidth)}  ${name(book)}`)
  if (!command) return text('')
  switch (command) {
    case 'help':
      return text(helpText())
    case 'pwd':
      return text(sanitize(`${root}${currentSheet ? `/${currentSheet}` : ''}`))
    case 'whoami':
      return text(username)
    case 'date':
      return text(new Date().toString())
    case 'echo':
      return text(sanitize(rest.join(' ')))
    case 'history':
      return text(
        (context.history ?? [])
          .map((line, index) => `${String(index + 1).padStart(5)}  ${line}`)
          .join('\n')
      )
    case 'ls': {
      if (!currentSheet)
        return text(
          sheets
            .map((sheet) => ansi.bold(ansi.blue(`${sanitize(sheet.name)}/`)))
            .join('\n')
        )
      if (!flags.some((flag) => flag.includes('l')))
        return text(listing.join('\n') || ansi.gray('(本はまだありません)'))
      return text(
        [
          ansi.gray(`total ${books.length}`),
          ...books.map((book) =>
            [
              ansi.gray('-r--r--r--'),
              padEnd(book.month || '', 4),
              padEnd(sanitize(book.impression || '-'), 2),
              id(book, idWidth),
              name(book),
              ansi.cyan(`[${sanitize(book.category) || '未分類'}]`),
            ].join(' ')
          ),
        ].join('\n')
      )
    }
    case 'tree': {
      const names = sheets.map((sheet) => sheet.name)
      const lines = [ansi.bold(ansi.blue(`${root}/`))]
      names.forEach((sheet, index) => {
        const last = index === names.length - 1
        lines.push(
          `${last ? '└──' : '├──'} ${ansi.bold(ansi.blue(`${sanitize(sheet)}/`))}`
        )
        if (sheet === currentSheet)
          books.forEach((book, i) =>
            lines.push(
              `${last ? '    ' : '│   '}${i === books.length - 1 ? '└──' : '├──'} ${id(book)}  ${name(book)}`
            )
          )
      })
      lines.push('', ansi.gray(`${names.length} directories`))
      return text(lines.join('\n'))
    }
    case 'cd': {
      if (!argument || ['..', '/', '~', root, `${root}/`].includes(argument))
        return { type: 'cd', sheet: null }
      if (argument === '.') return { type: 'cd', sheet: currentSheet }
      let target = argument
      if (target.startsWith(`${root}/`)) target = target.slice(root.length + 1)
      else target = target.replace(/^(\.\/|\.\.\/|~\/)/, '')
      if (target.endsWith('/')) target = target.slice(0, -1)
      const sheet = sheets.find((sheet) => sheet.name === target)
      return sheet
        ? { type: 'cd', sheet: sheet.name }
        : text(`cd: no such file or directory: ${sanitize(argument)}`)
    }
    case 'less':
    case 'cat':
    case 'open': {
      if (!currentSheet)
        return text(
          `${command}: 先に cd <シート名> でシートに移動してください。`
        )
      const book = findBook(command, argument, books)
      if (typeof book === 'string') return text(sanitize(book))
      if (command === 'less') return { type: 'less', book }
      if (command === 'open')
        return {
          type: 'open',
          href: `/books/${book.id}`,
          text: ansi.gray(`opening /books/${book.id} ...`),
        }
      return text(sanitize(book.memo) || ansi.gray('(メモはありません)'))
    }
    case 'grep': {
      if (!argument) return text('grep: 使い方: grep <検索語>')
      if (!currentSheet)
        return text('grep: 先に cd <シート名> でシートに移動してください。')
      const needle = argument.toLowerCase()
      const highlight = (line: string) => {
        const lower = line.toLowerCase()
        let result = ''
        let index = 0
        for (
          let found = lower.indexOf(needle);
          found !== -1;
          found = lower.indexOf(needle, index)
        ) {
          result +=
            line.slice(index, found) +
            ansi.bold(ansi.red(line.slice(found, found + needle.length)))
          index = found + needle.length
        }
        return result + line.slice(index)
      }
      const hits = books.flatMap((book) =>
        [book.title, book.author, ...(book.memo || '').split('\n')]
          .map(sanitize)
          .filter((line) => line.toLowerCase().includes(needle))
          .map(
            (line) =>
              `${ansi.magenta(String(book.id))}${ansi.cyan(':')}${highlight(line.trim())}`
          )
      )
      return text(
        hits.length > 200
          ? [
              ...hits.slice(0, 200),
              ansi.gray(`... ${hits.length - 200} more`),
            ].join('\n')
          : hits.join('\n')
      )
    }
    case 'stats':
      return currentSheet
        ? text(stats(books, currentSheet))
        : text('stats: 先に cd <シート名> でシートに移動してください。')
    case 'neofetch':
      return text(neofetch(context))
    case 'ai':
      return text(aiAnalysis(context.aiSummary))
    case 'clear':
      return { type: 'clear' }
    case 'exit':
    case 'logout':
      return { type: 'mode', mode: 'normal', text: 'logout' }
    case 'mode':
      return ['normal', 'cli'].includes(argument)
        ? { type: 'mode', mode: argument as UiMode, text: '' }
        : text('mode: 使い方: mode normal|cli')
    default:
      return text(`${SHELL}: command not found: ${sanitize(command)}`)
  }
}

const commonPrefix = (values: string[]) =>
  values.reduce((prefix, value) => {
    let i = 0
    while (i < prefix.length && prefix[i] === value[i]) i++
    return prefix.slice(0, i)
  })

export interface Completion {
  /** 補完後の入力行 */
  line: string
  /** 候補が複数ある場合の一覧（表示用） */
  candidates: string[]
}

export function completeCommand(
  input: string,
  sheets: TerminalSheet[],
  books: Book[]
): Completion {
  const separator = input.search(/\s/)
  if (separator === -1) {
    const matches = COMMANDS.filter((command) => command.startsWith(input))
    if (matches.length === 1) return { line: `${matches[0]} `, candidates: [] }
    return {
      line: matches.length ? commonPrefix(matches) : input,
      candidates: matches.length > 1 ? matches : [],
    }
  }
  const command = input.slice(0, separator)
  const rawPrefix = input.slice(separator).trimStart()
  let prefix: string
  try {
    prefix = tokenizeCommand(rawPrefix)[0] ?? ''
  } catch {
    prefix = rawPrefix.replace(/^["']/, '')
  }
  const options: Array<{ value: string; label: string }> =
    command === 'cd'
      ? sheets.map((sheet) => ({ value: sheet.name, label: `${sheet.name}/` }))
      : ['less', 'cat', 'open'].includes(command)
        ? books.map((book) => ({
            value: String(book.id),
            label: `${book.id}  ${book.title}`,
          }))
        : command === 'mode'
          ? ['normal', 'cli'].map((value) => ({ value, label: value }))
          : []
  const matches = options.filter((option) => option.value.startsWith(prefix))
  if (!matches.length) return { line: input, candidates: [] }
  if (matches.length === 1)
    return {
      line: `${command} ${escapeArgument(matches[0].value)}${command === 'cd' ? '/' : ' '}`,
      candidates: [],
    }
  const shared = commonPrefix(matches.map((option) => option.value))
  return {
    line: `${command} ${escapeArgument(shared.length > prefix.length ? shared : prefix)}`,
    candidates: matches.map((option) => option.label),
  }
}
