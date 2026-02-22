import { User } from '../user';

describe('User', () => {
  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const user = User.fromDatabase(
        'user-1',
        'テストユーザー',
        'test@example.com',
        'https://example.com/avatar.jpg',
        false,
      );

      expect(user.id).toBe('user-1');
      expect(user.name).toBe('テストユーザー');
      expect(user.email).toBe('test@example.com');
      expect(user.image).toBe('https://example.com/avatar.jpg');
      expect(user.admin).toBe(false);
    });

    it('nullフィールドを含むユーザーを復元できる', () => {
      const user = User.fromDatabase('user-1', null, null, null, false);

      expect(user.name).toBeNull();
      expect(user.email).toBeNull();
      expect(user.image).toBeNull();
    });

    it('管理者ユーザーを復元できる', () => {
      const user = User.fromDatabase(
        'admin-1',
        '管理者',
        'admin@example.com',
        null,
        true,
      );
      expect(user.admin).toBe(true);
    });
  });

  describe('updateName', () => {
    it('ユーザー名を更新できる', () => {
      const user = User.fromDatabase(
        'user-1',
        '旧名前',
        'test@example.com',
        null,
        false,
      );
      user.updateName('新名前');
      expect(user.name).toBe('新名前');
    });

    it('空のユーザー名に更新するとエラーになる', () => {
      const user = User.fromDatabase(
        'user-1',
        'テスト',
        'test@example.com',
        null,
        false,
      );
      expect(() => user.updateName('')).toThrow('ユーザー名は必須です');
    });

    it('空白のみのユーザー名に更新するとエラーになる', () => {
      const user = User.fromDatabase(
        'user-1',
        'テスト',
        'test@example.com',
        null,
        false,
      );
      expect(() => user.updateName('   ')).toThrow('ユーザー名は必須です');
    });

    it('ユーザー名の前後空白がトリムされる', () => {
      const user = User.fromDatabase(
        'user-1',
        'テスト',
        'test@example.com',
        null,
        false,
      );
      user.updateName('  新名前  ');
      expect(user.name).toBe('新名前');
    });
  });
});
