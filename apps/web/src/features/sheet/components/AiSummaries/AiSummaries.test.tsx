import { render, screen } from '@testing-library/react'
import { AiSummaries } from './AiSummaries'
import useAiHelpers from './useAiHelpers'
import { migrateAnalysis } from './migrator'

jest.mock('./useAiHelpers')
jest.mock('./Confirm', () => ({ Confirm: () => null }))
jest.mock('@/features/ui-mode/UiModeProvider', () => ({
  useUiMode: () => ({ mode: 'normal' }),
}))

const analysis = {
  id: 1,
  _schemaVersion: 4,
  personality_type: 'INTP',
  character_summary: '自分の言葉で確かめたい人',
  reading_trend_summary: '種明かしに惹かれる',
  reading_trend_analysis: '読書傾向の本文',
  sentiment_summary: '納得できる驚きが好き',
  sentiment_analysis: '感情分析の本文',
  hidden_theme_summary: '自分の判断を確かめたい',
  hidden_theme_discovery: '共通テーマの本文',
  overall_summary: '知識を暮らしで試す',
  overall_feedback: '総評の本文',
}

const showAnalysis = (json: Record<string, unknown>) => {
  ;(useAiHelpers as jest.Mock).mockReturnValue({ json, summaries: [json] })
  return render(
    <AiSummaries
      username="reader"
      sheet="2026"
      aiSummaries={[]}
      bookCount={42}
      isMine={false}
      books={[]}
    />
  )
}

it('MBTIと4つのまとめを、それぞれの本文と同じカードに表示する', () => {
  showAnalysis(analysis)
  expect(screen.getByText('INTP')).toBeTruthy()
  expect(screen.getByText('読書記録から推定したMBTIタイプ')).toBeTruthy()
  for (const [summary, body] of [
    [analysis.reading_trend_summary, analysis.reading_trend_analysis],
    [analysis.sentiment_summary, analysis.sentiment_analysis],
    [analysis.hidden_theme_summary, analysis.hidden_theme_discovery],
    [analysis.overall_summary, analysis.overall_feedback],
  ]) {
    const heading = screen.getByRole('heading', { level: 4, name: summary })
    expect(heading.parentElement).toBe(screen.getByText(body).parentElement)
  }
  expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(4)
})

it('生成途中は本文より先に届いたまとめも表示する', () => {
  showAnalysis({ reading_trend_summary: analysis.reading_trend_summary })
  expect(screen.getByText(analysis.reading_trend_summary)).toBeTruthy()
})

it('まとめのない分析と、元のバージョンに対応する見出しを表示できる', () => {
  showAnalysis(
    migrateAnalysis({
      id: 2,
      character_summary: '人物像',
      reading_trend_analysis: '読書傾向の本文',
      sentiment_analysis: '感情分析の本文',
      what_if_scenario: 'シナリオの本文',
      overall_feedback: '総評の本文',
    })
  )
  expect(screen.getByText('もしもシナリオ')).toBeTruthy()
  expect(screen.getByText('シナリオの本文')).toBeTruthy()
  expect(screen.queryAllByRole('heading', { level: 4 })).toHaveLength(0)
})
