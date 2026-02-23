import { TemplateBook } from './template-book';

describe('TemplateBook', () => {
  describe('create', () => {
    it('新規テンプレートを作成できる', () => {
      const book = TemplateBook.create({
        userId: 'user-1',
        name: 'テンプレート1',
        title: 'テスト書籍',
        author: '著者',
        category: 'カテゴリ',
        image: 'image.jpg',
        memo: 'テンプレートメモ',
        isPublicMemo: false,
      });

      expect(book.id).toBeNull();
      expect(book.userId).toBe('user-1');
      expect(book.name).toBe('テンプレート1');
      expect(book.title).toBe('テスト書籍');
      expect(book.author).toBe('著者');
      expect(book.category).toBe('カテゴリ');
      expect(book.image).toBe('image.jpg');
      expect(book.memo).toBe('テンプレートメモ');
      expect(book.isPublicMemo).toBe(false);
      expect(book.created).toBeInstanceOf(Date);
      expect(book.updated).toBeInstanceOf(Date);
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const book = TemplateBook.fromDatabase(
        '1',
        'user-1',
        'テンプレート名',
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        'メモ',
        true,
        created,
        updated,
      );

      expect(book.id).toBe('1');
      expect(book.userId).toBe('user-1');
      expect(book.name).toBe('テンプレート名');
      expect(book.title).toBe('タイトル');
      expect(book.isPublicMemo).toBe(true);
      expect(book.created).toBe(created);
      expect(book.updated).toBe(updated);
    });
  });
});
