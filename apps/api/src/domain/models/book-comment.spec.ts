import { BookComment } from './book-comment';

describe('BookComment', () => {
  describe('create', () => {
    it('有効な値でコメントを作成できる', () => {
      const comment = BookComment.create({
        bookId: 1,
        userId: 'user-1',
        content: '  面白かったです  ',
      });

      expect(comment.id).toBeNull();
      expect(comment.bookId).toBe(1);
      expect(comment.userId).toBe('user-1');
      // 前後の空白はトリミングされる
      expect(comment.content).toBe('面白かったです');
    });

    it('空文字のコメントはエラー', () => {
      expect(() =>
        BookComment.create({ bookId: 1, userId: 'user-1', content: '   ' }),
      ).toThrow('コメントを入力してください');
    });

    it('最大文字数を超えるコメントはエラー', () => {
      const longContent = 'a'.repeat(BookComment.MAX_CONTENT_LENGTH + 1);
      expect(() =>
        BookComment.create({
          bookId: 1,
          userId: 'user-1',
          content: longContent,
        }),
      ).toThrow('コメントは1000文字以内で入力してください');
    });

    it('書籍IDが不正な場合はエラー', () => {
      expect(() =>
        BookComment.create({ bookId: 0, userId: 'user-1', content: 'test' }),
      ).toThrow('書籍IDが不正です');
    });

    it('ユーザーIDが空の場合はエラー', () => {
      expect(() =>
        BookComment.create({ bookId: 1, userId: '', content: 'test' }),
      ).toThrow('ユーザーIDは必須です');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-06-01');
      const updated = new Date('2025-06-02');
      const comment = BookComment.fromDatabase(
        10,
        1,
        'user-1',
        'コメント本文',
        created,
        updated,
        'テストユーザー',
        'avatar.jpg',
      );

      expect(comment.id).toBe(10);
      expect(comment.bookId).toBe(1);
      expect(comment.userId).toBe('user-1');
      expect(comment.content).toBe('コメント本文');
      expect(comment.created).toBe(created);
      expect(comment.updated).toBe(updated);
      expect(comment.username).toBe('テストユーザー');
      expect(comment.userImage).toBe('avatar.jpg');
    });

    it('userImageがnullでも復元できる', () => {
      const comment = BookComment.fromDatabase(
        10,
        1,
        'user-1',
        'コメント',
        new Date(),
        new Date(),
        'ユーザー',
        null,
      );
      expect(comment.userImage).toBeNull();
    });
  });
});
