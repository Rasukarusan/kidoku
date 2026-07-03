import { AuthorFollow } from './author-follow';

describe('AuthorFollow', () => {
  describe('create', () => {
    it('著者フォローを作成できる', () => {
      const follow = AuthorFollow.create({
        userId: 'user-1',
        authorName: ' 村上春樹 ',
      });
      expect(follow.id).toBeNull();
      expect(follow.authorName).toBe('村上春樹');
    });

    it('著者名が空・ハイフンの場合はエラー', () => {
      expect(() =>
        AuthorFollow.create({ userId: 'user-1', authorName: ' ' }),
      ).toThrow('著者名は必須です');
      expect(() =>
        AuthorFollow.create({ userId: 'user-1', authorName: '-' }),
      ).toThrow('著者名は必須です');
    });

    it('著者名が120文字を超える場合はエラー', () => {
      expect(() =>
        AuthorFollow.create({
          userId: 'user-1',
          authorName: 'あ'.repeat(121),
        }),
      ).toThrow('著者名は120文字以内で入力してください');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2026-01-01');
      const follow = AuthorFollow.fromDatabase(
        '1',
        'user-1',
        '村上春樹',
        created,
      );
      expect(follow.id).toBe('1');
      expect(follow.authorName).toBe('村上春樹');
      expect(follow.created).toBe(created);
    });
  });
});
