import { Quote } from './quote';

describe('Quote', () => {
  describe('create', () => {
    it('新規引用を作成できる', () => {
      const quote = Quote.create({
        userId: 'user-1',
        bookId: 1,
        page: 42,
        text: '名言です',
        comment: '心に残った',
      });

      expect(quote.id).toBeNull();
      expect(quote.userId).toBe('user-1');
      expect(quote.bookId).toBe(1);
      expect(quote.page).toBe(42);
      expect(quote.text).toBe('名言です');
      expect(quote.comment).toBe('心に残った');
      expect(quote.created).toBeInstanceOf(Date);
    });

    it('ページ・コメントなしでも作成できる', () => {
      const quote = Quote.create({
        userId: 'user-1',
        bookId: 1,
        page: null,
        text: '引用文',
        comment: null,
      });

      expect(quote.page).toBeNull();
      expect(quote.comment).toBeNull();
    });

    it('引用文が空の場合はエラー', () => {
      expect(() =>
        Quote.create({
          userId: 'user-1',
          bookId: 1,
          page: null,
          text: '  ',
          comment: null,
        }),
      ).toThrow('引用文は必須です');
    });

    it('引用文が2000文字を超える場合はエラー', () => {
      expect(() =>
        Quote.create({
          userId: 'user-1',
          bookId: 1,
          page: null,
          text: 'あ'.repeat(2001),
          comment: null,
        }),
      ).toThrow('引用文は2000文字以内で入力してください');
    });

    it('ページ番号が0以下の場合はエラー', () => {
      expect(() =>
        Quote.create({
          userId: 'user-1',
          bookId: 1,
          page: 0,
          text: '引用文',
          comment: null,
        }),
      ).toThrow('ページ番号は正の整数で指定してください');
    });

    it('書籍IDが不正な場合はエラー', () => {
      expect(() =>
        Quote.create({
          userId: 'user-1',
          bookId: 0,
          page: null,
          text: '引用文',
          comment: null,
        }),
      ).toThrow('書籍IDが不正です');
    });
  });

  describe('update', () => {
    it('引用を更新できる', () => {
      const quote = Quote.fromDatabase(
        '1',
        'user-1',
        1,
        10,
        '旧引用',
        null,
        new Date('2025-01-01'),
        new Date('2025-01-01'),
      );

      quote.update({ page: 20, text: '新引用', comment: '追記' });

      expect(quote.page).toBe(20);
      expect(quote.text).toBe('新引用');
      expect(quote.comment).toBe('追記');
    });

    it('更新時も引用文が空ならエラー', () => {
      const quote = Quote.fromDatabase(
        '1',
        'user-1',
        1,
        null,
        '引用',
        null,
        new Date(),
        new Date(),
      );

      expect(() =>
        quote.update({ page: null, text: '', comment: null }),
      ).toThrow('引用文は必須です');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const quote = Quote.fromDatabase(
        '1',
        'user-1',
        2,
        100,
        '引用文',
        'コメント',
        created,
        updated,
      );

      expect(quote.id).toBe('1');
      expect(quote.bookId).toBe(2);
      expect(quote.page).toBe(100);
      expect(quote.text).toBe('引用文');
      expect(quote.comment).toBe('コメント');
      expect(quote.created).toBe(created);
      expect(quote.updated).toBe(updated);
    });
  });
});
