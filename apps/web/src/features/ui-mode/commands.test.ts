import { Book } from '@/types/book'
import { stripAnsi } from './ansi'
import {
  CommandContext,
  completeCommand,
  runCommand,
  tokenizeCommand,
} from './commands'

const book = {
  id: 42,
  title: '本の名前',
  author: '著者',
  image: '/cover.png',
  memo: '![画像](/memo.png)',
} as Book
const sheets = [
  { id: '1', name: '2026', order: 2 },
  { id: '2', name: '読みたい 本', order: 1 },
  { id: '3', name: 'a"b\\c', order: 0 },
]
const context: CommandContext = {
  username: 'reader',
  currentSheet: '2026',
  sheets,
  books: [book],
}

const output = (command: string, ctx: CommandContext = context) => {
  const result = runCommand(command, ctx)
  return 'text' in result ? stripAnsi(result.text) : ''
}

describe('reading CLI', () => {
  it('starts the lk fuzzy finder only inside a sheet', () => {
    expect(runCommand('lk コード 著者', context)).toEqual({
      type: 'lk',
      query: 'コード 著者',
    })
    expect(output('lk', { ...context, currentSheet: null })).toContain(
      'cd <シート名>'
    )
    expect(output('lk', { ...context, books: [] })).toBe('lk: 本がありません')
  })

  it('moves by name, quoted name and absolute virtual path', () => {
    for (const command of [
      'cd "読みたい 本"',
      "cd '読みたい 本'",
      'cd /reader/sheets/読みたい 本/',
    ]) {
      expect(runCommand(command, context)).toEqual({
        type: 'cd',
        sheet: '読みたい 本',
      })
    }
    expect(runCommand('cd ..', context)).toEqual({ type: 'cd', sheet: null })
    expect(runCommand('cd .', context)).toEqual({ type: 'cd', sheet: '2026' })
    expect(output('cd missing')).toBe('cd: no such file or directory: missing')
  })

  it('lists the correct level and displays book IDs in the tree', () => {
    expect(runCommand('pwd', context)).toEqual({
      type: 'text',
      text: '/reader/sheets/2026',
    })
    expect(output('ls')).toBe('42  本の名前 — 著者')
    expect(output('ls', { ...context, currentSheet: null })).toContain(
      '読みたい 本/'
    )
    expect(output('tree')).toContain('└── 42  本の名前')
    expect(output('ls', { ...context, books: [] })).toBe('(本はまだありません)')
    expect(output('ls -l')).toContain('42 本の名前 — 著者 [未分類]')
  })

  it('reads by ID or title while retaining the original cover and rich memo', () => {
    expect(runCommand('less 42', context)).toEqual({ type: 'less', book })
    expect(runCommand('open "本の名前"', context)).toMatchObject({
      type: 'open',
      href: '/books/42',
    })
    expect(output('cat 42')).toBe('![画像](/memo.png)')
    expect(
      runCommand('less 42', { ...context, currentSheet: null })
    ).toMatchObject({ type: 'text' })
    expect(runCommand('less 404', context)).toMatchObject({
      text: expect.stringContaining('見つかりません'),
    })
    expect(
      runCommand('less 本の名前', {
        ...context,
        books: [book, { ...book, id: 43 }],
      })
    ).toMatchObject({ text: expect.stringContaining('IDを確認') })
  })

  it('reports malformed input and treats shell commands as unsupported input', () => {
    expect(output('cd "2026')).toBe('kidoku: 引用符を閉じてください。')
    expect(output('rm -rf /')).toBe('kidoku: command not found: rm')
    expect(runCommand('less $(cat secret)', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('見つかりません'),
    })
    expect(runCommand('mode cli', context)).toMatchObject({
      type: 'mode',
      mode: 'cli',
    })
    expect(runCommand('exit', context)).toMatchObject({
      type: 'mode',
      mode: 'normal',
    })
    expect(runCommand('mode terminal', context)).toMatchObject({
      type: 'text',
    })
    expect(runCommand('mode invalid', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('使い方'),
    })
  })

  it('searches, echoes and lists history without interpreting control sequences', () => {
    expect(output('grep 画像')).toBe('42:![画像](/memo.png)')
    expect(output('grep nothing')).toBe('')
    expect(output('echo "a  b" c')).toBe('a  b c')
    expect(output('echo "\x1b[31mred"')).toBe('[31mred')
    expect(output('history', { ...context, history: ['ls', 'pwd'] })).toBe(
      '    1  ls\n    2  pwd'
    )
    expect(output('stats')).toContain(' 1月 │ 0')
  })

  it('completes commands, sheet names and book IDs with parseable escaping', () => {
    expect(completeCommand('tr', sheets, [book])).toEqual({
      line: 'tree ',
      candidates: [],
    })
    expect(completeCommand('h', sheets, [book])).toEqual({
      line: 'h',
      candidates: ['help', 'history'],
    })
    expect(completeCommand('less 4', sheets, [book])).toEqual({
      line: 'less 42 ',
      candidates: [],
    })
    expect(completeCommand('cd 20', sheets, [book]).line).toBe('cd 2026/')
    for (const sheet of sheets) {
      const { line } = completeCommand(
        `cd ${sheet.name.slice(0, 1)}`,
        [sheet],
        []
      )
      expect(tokenizeCommand(line)).toEqual(['cd', `${sheet.name}/`])
      expect(runCommand(line, context)).toEqual({
        type: 'cd',
        sheet: sheet.name,
      })
    }
  })
})
