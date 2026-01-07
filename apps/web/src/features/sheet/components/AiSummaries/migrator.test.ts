import { migrateAnalysis, migrateAnalyses } from './migrator'

describe('migrateAnalysis()', () => {
  describe('バージョン1からバージョン2へのマイグレーション', () => {
    it('what_if_scenarioがhidden_theme_discoveryにリネームされること', () => {
      const v1Data = {
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        what_if_scenario: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v1Data)

      expect(result).toEqual({
        _schemaVersion: 2,
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      })
      expect(result).not.toHaveProperty('what_if_scenario')
    })

    it('_schemaVersionが1の場合も正しく変換されること', () => {
      const v1Data = {
        _schemaVersion: 1,
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        what_if_scenario: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v1Data)

      expect(result._schemaVersion).toBe(2)
      expect(result.hidden_theme_discovery).toBe('テストシナリオ')
      expect(result).not.toHaveProperty('what_if_scenario')
    })
  })

  describe('すでに最新バージョンの場合', () => {
    it('_schemaVersionが2の場合は変換されずそのまま返ること', () => {
      const v2Data = {
        _schemaVersion: 2,
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストテーマ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v2Data)

      expect(result).toEqual(v2Data)
    })

    it('すでにhidden_theme_discoveryを持つデータはそのまま返ること', () => {
      const v2Data = {
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストテーマ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v2Data)

      expect(result.hidden_theme_discovery).toBe('テストテーマ')
    })
  })

  describe('エッジケース', () => {
    it('空のデータでもエラーが発生しないこと', () => {
      const emptyData = {}

      expect(() => migrateAnalysis(emptyData)).not.toThrow()
    })

    it('不完全なデータでもマイグレーションが適用されること', () => {
      const partialData = {
        what_if_scenario: 'テストシナリオのみ',
      }

      const result = migrateAnalysis(partialData)

      expect(result.hidden_theme_discovery).toBe('テストシナリオのみ')
      expect(result).not.toHaveProperty('what_if_scenario')
    })
  })
})

describe('migrateAnalyses()', () => {
  it('複数のデータをバッチでマイグレーションできること', () => {
    const analyses = [
      {
        character_summary: '人物1',
        what_if_scenario: 'シナリオ1',
        reading_trend_analysis: '傾向1',
        sentiment_analysis: '感情1',
        overall_feedback: '総評1',
      },
      {
        _schemaVersion: 2,
        character_summary: '人物2',
        hidden_theme_discovery: 'テーマ2',
        reading_trend_analysis: '傾向2',
        sentiment_analysis: '感情2',
        overall_feedback: '総評2',
      },
    ]

    const results = migrateAnalyses(analyses)

    expect(results).toHaveLength(2)
    expect(results[0].hidden_theme_discovery).toBe('シナリオ1')
    expect(results[0]).not.toHaveProperty('what_if_scenario')
    expect(results[1].hidden_theme_discovery).toBe('テーマ2')
  })

  it('空の配列でもエラーが発生しないこと', () => {
    const results = migrateAnalyses([])

    expect(results).toEqual([])
  })
})
