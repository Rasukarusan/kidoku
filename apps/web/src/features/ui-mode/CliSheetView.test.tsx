import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CliSheetView } from './CliSheetView'
import { useUiMode } from './UiModeProvider'

const push = jest.fn()
jest.mock('next/router', () => ({ useRouter: () => ({ push }) }))
jest.mock('./UiModeProvider', () => ({ useUiMode: jest.fn() }))
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }))

const setMode = jest.fn()
const props = {
  books: [],
  sheets: [{ id: '1', name: '2026', order: 0 }],
  year: '2026',
  username: 'reader',
}

const type = (command: string) => {
  const input = screen.getByRole('textbox', { name: 'CLIコマンド' })
  fireEvent.change(input, { target: { value: command } })
  fireEvent.submit(input.closest('form')!)
}

beforeEach(() => {
  ;(useUiMode as jest.Mock).mockReturnValue({ mode: 'cli', setMode })
  setMode.mockClear()
})

it('shows a login banner and echoes commands with a shell prompt', () => {
  render(<CliSheetView {...props} />)
  const log = screen.getByRole('log')
  expect(log.textContent).toContain('Last login:')
  type('pwd')
  expect(log.textContent).toContain('reader@kidoku:~/sheets/2026$ pwd')
  expect(log.textContent).toContain('/reader/sheets/2026')
  type('cd ..')
  type('ls')
  expect(log.textContent).toContain('reader@kidoku:~/sheets$ ls2026/')
  type('clear')
  expect(log.textContent).toBe('')
})

it('displays AI analysis within the terminal', () => {
  render(
    <CliSheetView
      {...props}
      aiSummary={{
        id: 1,
        personality_type: 'strategist',
        character_summary: '分析結果',
        reading_trend_analysis: '読書傾向の本文',
        sentiment_analysis: '',
        hidden_theme_discovery: '',
        overall_feedback: '',
      }}
    />
  )
  type('ai')
  expect(screen.getByRole('log').textContent).toContain('STRATEGIST')
  expect(screen.getByRole('log').textContent).toContain('読書傾向の本文')
})

it('supports history, Ctrl+C and exit', () => {
  render(<CliSheetView {...props} />)
  const input = screen.getByRole('textbox', { name: 'CLIコマンド' })
  type('whoami')
  fireEvent.keyDown(input, { key: 'ArrowUp' })
  expect(input).toHaveProperty('value', 'whoami')
  fireEvent.keyDown(input, { key: 'c', ctrlKey: true })
  expect(input).toHaveProperty('value', '')
  expect(screen.getByRole('log').textContent).toContain('whoami^C')
  type('exit')
  expect(setMode).toHaveBeenCalledWith('normal')
})

const book = {
  id: 42,
  title: '本',
  author: '著者',
  memo: 'old',
  image: '',
  month: '1月',
} as unknown as import('@/types/book').Book

const vim = (keys: string[]) => {
  const editor = screen.getByRole('textbox', { name: /^vim:/ })
  for (const key of keys)
    fireEvent.keyDown(
      editor,
      key.startsWith('C-') ? { key: key.slice(2), ctrlKey: true } : { key }
    )
}

it('edits a memo with vim and saves it with :wq', async () => {
  const onSaveMemo = jest.fn().mockResolvedValue(undefined)
  render(
    <CliSheetView {...props} books={[book]} canEdit onSaveMemo={onSaveMemo} />
  )
  type('vim 42')
  expect(screen.getByRole('status').textContent).toContain('"本.md" 1L, 3B')
  vim(['A', ' ', 'n', 'e', 'w', 'Escape', ':', 'w', 'q', 'Enter'])
  await waitFor(() => expect(onSaveMemo).toHaveBeenCalledWith(42, 'old new'))
  await waitFor(() =>
    expect(screen.queryByRole('textbox', { name: /^vim:/ })).toBeNull()
  )
})

it('refuses to save memos of other users', async () => {
  const onSaveMemo = jest.fn()
  render(<CliSheetView {...props} books={[book]} onSaveMemo={onSaveMemo} />)
  type('vim 42')
  vim(['x', ':', 'w', 'Enter'])
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toContain('E45')
  )
  expect(onSaveMemo).not.toHaveBeenCalled()
})

it('loads ~/.zshrc on login and persists edits made with vim', async () => {
  localStorage.setItem(
    'kidoku-zshrc',
    "alias hi='echo hello'\nPROMPT='%n> '\nwhoami"
  )
  render(<CliSheetView {...props} />)
  const log = screen.getByRole('log')
  expect(log.textContent).toContain('reader')
  type('hi')
  expect(log.textContent).toContain('reader> hihello')
  type('vim ~/.zshrc')
  vim(['G', 'o', 'l', 's', 'Escape', ':', 'w', 'q', 'Enter'])
  await waitFor(() =>
    expect(localStorage.getItem('kidoku-zshrc')).toContain('\nls')
  )
  localStorage.clear()
})
