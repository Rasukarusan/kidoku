import { Book } from '../book';

describe('Book', () => {
  const validParams = {
    userId: 'user-1',
    sheetId: 1,
    title: 'テスト書籍',
    author: 'テスト著者',
    category: '技術書',
    image: 'https://example.com/image.jpg',
    impression: '★★★',
    memo: 'テストメモ',
    isPublicMemo: false,
    finished: new Date('2025-01-01'),
  };

  describe('create', () => {
    it('有効なパラメータで書籍を作成できる', () => {
      const book = Book.create(validParams);

      expect(book.id).toBeNull();
      expect(book.userId).toBe('user-1');
      expect(book.sheetId).toBe(1);
      expect(book.title).toBe('テスト書籍');
      expect(book.author).toBe('テスト著者');
      expect(book.category).toBe('技術書');
      expect(book.image).toBe('https://example.com/image.jpg');
      expect(book.impression).toBe('★★★');
      expect(book.memo).toBe('テストメモ');
      expect(book.isPublicMemo).toBe(false);
      expect(book.isPurchasable).toBe(false);
      expect(book.finished).toEqual(new Date('2025-01-01'));
    });

    it('タイトルが空の場合エラーになる', () => {
      expect(() => Book.create({ ...validParams, title: '' })).toThrow(
        '書籍タイトルは必須です',
      );
    });

    it('タイトルが空白のみの場合エラーになる', () => {
      expect(() => Book.create({ ...validParams, title: '   ' })).toThrow(
        '書籍タイトルは必須です',
      );
    });

    it('タイトルが100文字を超える場合エラーになる', () => {
      expect(() =>
        Book.create({ ...validParams, title: 'a'.repeat(101) }),
      ).toThrow('タイトルは100文字以下で入力してください');
    });

    it('タイトルが100文字ちょうどの場合は作成できる', () => {
      const book = Book.create({ ...validParams, title: 'a'.repeat(100) });
      expect(book.title).toBe('a'.repeat(100));
    });

    it('タイトルの前後空白がトリムされる', () => {
      const book = Book.create({ ...validParams, title: '  テスト  ' });
      expect(book.title).toBe('テスト');
    });

    it('isPurchasableのデフォルトはfalse', () => {
      const book = Book.create(validParams);
      expect(book.isPurchasable).toBe(false);
    });

    it('isPurchasableを指定できる', () => {
      const book = Book.create({ ...validParams, isPurchasable: true });
      expect(book.isPurchasable).toBe(true);
    });

    it('finishedがnullでも作成できる', () => {
      const book = Book.create({ ...validParams, finished: null });
      expect(book.finished).toBeNull();
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        'メモ',
        true,
        false,
        null,
        created,
        updated,
      );

      expect(book.id).toBe('1');
      expect(book.userId).toBe('user-1');
      expect(book.title).toBe('タイトル');
      expect(book.created).toBe(created);
      expect(book.updated).toBe(updated);
    });
  });

  describe('update', () => {
    it('タイトルを更新できる', () => {
      const book = Book.create(validParams);
      book.update({ title: '新しいタイトル' });
      expect(book.title).toBe('新しいタイトル');
    });

    it('空のタイトルに更新するとエラーになる', () => {
      const book = Book.create(validParams);
      expect(() => book.update({ title: '' })).toThrow(
        '書籍タイトルは必須です',
      );
    });

    it('100文字超のタイトルに更新するとエラーになる', () => {
      const book = Book.create(validParams);
      expect(() => book.update({ title: 'a'.repeat(101) })).toThrow(
        'タイトルは100文字以下で入力してください',
      );
    });

    it('複数フィールドを同時に更新できる', () => {
      const book = Book.create(validParams);
      book.update({
        author: '新著者',
        category: '新カテゴリ',
        memo: '新メモ',
        isPublicMemo: true,
      });

      expect(book.author).toBe('新著者');
      expect(book.category).toBe('新カテゴリ');
      expect(book.memo).toBe('新メモ');
      expect(book.isPublicMemo).toBe(true);
    });

    it('updatedが更新される', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-01');
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        'メモ',
        false,
        false,
        null,
        created,
        updated,
      );

      book.update({ author: '新著者' });
      expect(book.updated.getTime()).toBeGreaterThanOrEqual(updated.getTime());
    });
  });

  describe('updateImage', () => {
    it('画像URLを更新できる', () => {
      const book = Book.create(validParams);
      book.updateImage('https://example.com/new-image.jpg');
      expect(book.image).toBe('https://example.com/new-image.jpg');
    });
  });

  describe('getSanitizedMemo', () => {
    it('所有者は全メモを閲覧できる', () => {
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        '秘密のメモ',
        false,
        false,
        null,
        new Date(),
        new Date(),
      );
      expect(book.getSanitizedMemo(true)).toBe('秘密のメモ');
    });

    it('非所有者は非公開メモを閲覧できない', () => {
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        '秘密のメモ',
        false,
        false,
        null,
        new Date(),
        new Date(),
      );
      expect(book.getSanitizedMemo(false)).toBeNull();
    });

    it('非所有者は公開メモをマスキングされた状態で閲覧できる', () => {
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        '公開メモです',
        true,
        false,
        null,
        new Date(),
        new Date(),
      );

      const sanitized = book.getSanitizedMemo(false);
      expect(sanitized).not.toBeNull();
      // 先頭50%は見えて、残りはマスキングされる
      expect(sanitized).toContain('公開');
      expect(sanitized).toContain('●');
    });

    it('空のメモの場合は空文字を返す', () => {
      const book = Book.fromDatabase(
        '1',
        'user-1',
        1,
        'タイトル',
        '著者',
        'カテゴリ',
        'image.jpg',
        '★',
        '',
        true,
        false,
        null,
        new Date(),
        new Date(),
      );
      expect(book.getSanitizedMemo(false)).toBe('');
    });
  });
});
