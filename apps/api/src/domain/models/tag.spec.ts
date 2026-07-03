import { Tag } from './tag';

describe('Tag', () => {
  describe('create', () => {
    it('新規タグを作成できる', () => {
      const tag = Tag.create({ userId: 'user-1', name: ' 哲学 ' });
      expect(tag.id).toBeNull();
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('哲学'); // 前後空白は除去される
      expect(tag.created).toBeInstanceOf(Date);
    });

    it('タグ名が空の場合はエラー', () => {
      expect(() => Tag.create({ userId: 'user-1', name: '   ' })).toThrow(
        'タグ名は必須です',
      );
    });

    it('タグ名が60文字を超える場合はエラー', () => {
      expect(() =>
        Tag.create({ userId: 'user-1', name: 'あ'.repeat(61) }),
      ).toThrow('タグ名は60文字以内で入力してください');
    });

    it('ユーザーIDが空の場合はエラー', () => {
      expect(() => Tag.create({ userId: '', name: 'タグ' })).toThrow(
        'ユーザーIDは必須です',
      );
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const tag = Tag.fromDatabase('1', 'user-1', '哲学', created);
      expect(tag.id).toBe('1');
      expect(tag.name).toBe('哲学');
      expect(tag.created).toBe(created);
    });
  });
});
