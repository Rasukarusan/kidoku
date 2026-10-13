import { Book } from '@/types/book'
import { completeCommand, runCommand, tokenizeCommand } from './commands'

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
const context = {
  username: 'reader',
  currentSheet: '2026',
  sheets,
  books: [book],
}

describe('reading CLI', () => {
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
    expect(runCommand('cd missing', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('見つかりません'),
    })
  })

  it('lists the correct level and displays book IDs in the tree', () => {
    expect(runCommand('pwd', context)).toEqual({
      type: 'text',
      text: '/reader/sheets/2026',
    })
    expect(runCommand('ls', context)).toMatchObject({
      text: expect.stringContaining('42  本の名前'),
    })
    expect(runCommand('ls', { ...context, currentSheet: null })).toMatchObject({
      text: expect.stringContaining('読みたい 本/'),
    })
    expect(runCommand('tree', context)).toMatchObject({
      text: expect.stringContaining('└── 42  本の名前'),
    })
    expect(runCommand('ls', { ...context, books: [] })).toMatchObject({
      text: '本はまだありません。',
    })
  })

  it('reads by ID or title while retaining the original cover and rich memo', () => {
    expect(runCommand('less 42', context)).toEqual({ type: 'less', book })
    expect(runCommand('open "本の名前"', context)).toEqual({
      type: 'less',
      book,
    })
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
    expect(runCommand('cd "2026', context)).toEqual({
      type: 'text',
      text: '引用符を閉じてください。',
    })
    expect(runCommand('rm -rf /', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('未対応'),
    })
    expect(runCommand('less $(cat secret)', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('見つかりません'),
    })
    expect(runCommand('mode cli', context)).toEqual({
      type: 'mode',
      mode: 'cli',
    })
    expect(runCommand('mode invalid', context)).toMatchObject({
      type: 'text',
      text: expect.stringContaining('使い方'),
    })
  })

  it('completes commands, sheet names and book IDs with parseable quoting', () => {
    expect(completeCommand('tr', sheets, [book])).toEqual(['tree'])
    expect(completeCommand('less 4', sheets, [book])).toEqual(['less "42"'])
    for (const sheet of sheets) {
      const [completion] = completeCommand(
        `cd ${sheet.name.slice(0, 1)}`,
        [sheet],
        []
      )
      expect(tokenizeCommand(completion)).toEqual(['cd', sheet.name])
    }
  })
})
