import { AiSummary } from './ai-summary';

describe('AiSummary', () => {
  describe('create', () => {
    it('新規AI要約を作成できる', () => {
      const analysis = {
        character_summary: 'テスト',
        reading_trend_analysis: 'テスト',
      };
      const summary = AiSummary.create('user-1', 1, analysis, 500);

      expect(summary.id).toBeNull();
      expect(summary.userId).toBe('user-1');
      expect(summary.sheetId).toBe(1);
      expect(summary.analysis).toEqual(analysis);
      expect(summary.token).toBe(500);
      expect(summary.created).toBeInstanceOf(Date);
      expect(summary.updated).toBeInstanceOf(Date);
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const analysis = { key: 'value' };

      const summary = AiSummary.fromDatabase(
        '1',
        'user-1',
        1,
        analysis,
        1000,
        created,
        updated,
      );

      expect(summary.id).toBe('1');
      expect(summary.userId).toBe('user-1');
      expect(summary.sheetId).toBe(1);
      expect(summary.analysis).toEqual(analysis);
      expect(summary.token).toBe(1000);
      expect(summary.created).toBe(created);
      expect(summary.updated).toBe(updated);
    });
  });
});
