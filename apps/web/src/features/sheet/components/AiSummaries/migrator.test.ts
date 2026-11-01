import { migrateAnalysis } from './migrator'

describe('migrateAnalysis()', () => {
  describe('バージョン1から最新バージョンへのマイグレーション', () => {
    it('what_if_scenarioがhidden_theme_discoveryにリネームされ、personality_typeが追加されること', () => {
      const v1Data = {
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        what_if_scenario: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v1Data)

      expect(result).toEqual({
        _schemaVersion: 4,
        reading_trend_summary: '',
        sentiment_summary: '',
        hidden_theme_summary: '',
        overall_summary: '',
        _originalSchemaVersion: 1,
        personality_type: '',
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      })
      expect(result).not.toHaveProperty('what_if_scenario')
    })

    it('_originalSchemaVersionが保持されること', () => {
      const v1Data = {
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        what_if_scenario: 'テストシナリオ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v1Data)

      expect(result._originalSchemaVersion).toBe(1)
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

      expect(result._schemaVersion).toBe(4)
      expect(result._originalSchemaVersion).toBe(1)
      expect(result.hidden_theme_discovery).toBe('テストシナリオ')
      expect(result.personality_type).toBe('')
      expect(result).not.toHaveProperty('what_if_scenario')
    })
  })

  describe('バージョン2から最新バージョンへのマイグレーション', () => {
    it('personality_typeが空文字で追加されること', () => {
      const v2Data = {
        _schemaVersion: 2,
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストテーマ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v2Data)

      expect(result._schemaVersion).toBe(4)
      expect(result._originalSchemaVersion).toBe(2)
      expect(result.personality_type).toBe('')
      expect(result.hidden_theme_discovery).toBe('テストテーマ')
    })
  })

  describe('すでに最新バージョンの場合', () => {
    it('_schemaVersionが4の場合は変換されずそのまま返ること', () => {
      const v3Data = {
        _schemaVersion: 4,
        personality_type: 'adventurer',
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストテーマ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v3Data)

      expect(result).toEqual(v3Data)
      expect(result._originalSchemaVersion).toBeUndefined()
    })

    it('すでにpersonality_typeを持つデータは上書きされないこと', () => {
      const v2DataWithType = {
        _schemaVersion: 2,
        personality_type: 'detective',
        character_summary: 'テスト人物像',
        reading_trend_analysis: 'テスト傾向',
        sentiment_analysis: 'テスト感情',
        hidden_theme_discovery: 'テストテーマ',
        overall_feedback: 'テスト総評',
      }

      const result = migrateAnalysis(v2DataWithType)

      expect(result._schemaVersion).toBe(4)
      expect(result.personality_type).toBe('detective')
    })
  })

  it('バージョン3の本文とタイプを保ち、まとめを空文字で追加する', () => {
    const result = migrateAnalysis({
      _schemaVersion: 3,
      _originalSchemaVersion: 1,
      personality_type: 'adventurer',
      hidden_theme_discovery: 'もしもシナリオの本文',
      reading_trend_summary: '保存済みのまとめ',
    })
    expect(result._schemaVersion).toBe(4)
    expect(result._originalSchemaVersion).toBe(1)
    expect(result.personality_type).toBe('adventurer')
    expect(result.hidden_theme_discovery).toBe('もしもシナリオの本文')
    expect(result.reading_trend_summary).toBe('保存済みのまとめ')
    expect(result.sentiment_summary).toBe('')
    expect(result.hidden_theme_summary).toBe('')
    expect(result.overall_summary).toBe('')
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
      expect(result.personality_type).toBe('')
      expect(result).not.toHaveProperty('what_if_scenario')
    })
  })
})
