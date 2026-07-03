import { ReReading } from './re-reading';

describe('ReReading', () => {
  describe('create', () => {
    it('新規再読記録を作成できる', () => {
      const finished = new Date('2026-01-15');
      const reReading = ReReading.create({
        userId: 'user-1',
        bookId: 1,
        finished,
        memo: '2回目はより深く理解できた',
      });

      expect(reReading.id).toBeNull();
      expect(reReading.userId).toBe('user-1');
      expect(reReading.bookId).toBe(1);
      expect(reReading.finished).toBe(finished);
      expect(reReading.memo).toBe('2回目はより深く理解できた');
    });

    it('メモなしでも作成できる', () => {
      const reReading = ReReading.create({
        userId: 'user-1',
        bookId: 1,
        finished: new Date(),
        memo: null,
      });
      expect(reReading.memo).toBeNull();
    });

    it('読了日が不正な場合はエラー', () => {
      expect(() =>
        ReReading.create({
          userId: 'user-1',
          bookId: 1,
          finished: new Date('invalid'),
          memo: null,
        }),
      ).toThrow('読了日は必須です');
    });

    it('書籍IDが不正な場合はエラー', () => {
      expect(() =>
        ReReading.create({
          userId: 'user-1',
          bookId: 0,
          finished: new Date(),
          memo: null,
        }),
      ).toThrow('書籍IDが不正です');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const finished = new Date('2026-01-15');
      const created = new Date('2026-01-16');
      const reReading = ReReading.fromDatabase(
        '1',
        'user-1',
        2,
        finished,
        'メモ',
        created,
      );
      expect(reReading.id).toBe('1');
      expect(reReading.bookId).toBe(2);
      expect(reReading.finished).toBe(finished);
      expect(reReading.memo).toBe('メモ');
      expect(reReading.created).toBe(created);
    });
  });
});
