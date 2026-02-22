import { Comment } from '../comment';

describe('Comment', () => {
  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const updated = new Date('2025-06-01');
      const comment = Comment.fromDatabase(
        'book-1',
        'テスト書籍',
        '面白かった',
        'image.jpg',
        updated,
        'テストユーザー',
        'avatar.jpg',
        'sheet-1',
      );

      expect(comment.bookId).toBe('book-1');
      expect(comment.bookTitle).toBe('テスト書籍');
      expect(comment.bookMemo).toBe('面白かった');
      expect(comment.bookImage).toBe('image.jpg');
      expect(comment.bookUpdated).toBe(updated);
      expect(comment.username).toBe('テストユーザー');
      expect(comment.userImage).toBe('avatar.jpg');
      expect(comment.sheetId).toBe('sheet-1');
    });

    it('userImageがnullでも復元できる', () => {
      const comment = Comment.fromDatabase(
        'book-1',
        'テスト書籍',
        'メモ',
        'image.jpg',
        new Date(),
        'ユーザー',
        null,
        'sheet-1',
      );
      expect(comment.userImage).toBeNull();
    });
  });
});
