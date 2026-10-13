import { fireEvent, render, screen } from '@testing-library/react'
import { TerminalSheetView } from './TerminalSheetView'
import { useUiMode } from './UiModeProvider'

jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('./UiModeProvider', () => ({ useUiMode: jest.fn() }))
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }))

const props = {
  books: [],
  sheets: [{ id: '1', name: '2026', order: 0 }],
  year: '2026',
  username: 'reader',
}

it('CLI hides sheet links and displays AI analysis within the same terminal', () => {
  ;(useUiMode as jest.Mock).mockReturnValue({ mode: 'cli', setMode: jest.fn() })
  render(
    <TerminalSheetView
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
  expect(screen.queryByRole('navigation', { name: 'シートの移動' })).toBeNull()
  fireEvent.change(screen.getByRole('textbox', { name: 'CLIコマンド' }), {
    target: { value: 'ai' },
  })
  fireEvent.submit(
    screen.getByRole('textbox', { name: 'CLIコマンド' }).closest('form')!
  )
  expect(screen.getByRole('log').textContent).toContain('STRATEGIST')
  expect(screen.getByRole('log').textContent).toContain('読書傾向の本文')
})

it('terminal mode keeps sheet navigation', () => {
  ;(useUiMode as jest.Mock).mockReturnValue({
    mode: 'terminal',
    setMode: jest.fn(),
  })
  render(<TerminalSheetView {...props} />)
  expect(screen.getByRole('navigation', { name: 'シートの移動' })).toBeTruthy()
})
