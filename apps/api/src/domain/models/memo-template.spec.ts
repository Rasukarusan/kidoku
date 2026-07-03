import { MemoTemplate } from './memo-template';

describe('MemoTemplate', () => {
  describe('create', () => {
    it('新規メモテンプレートを作成できる', () => {
      const template = MemoTemplate.create({
        userId: 'user-1',
        name: '読書メモ',
        content: '【学び】\n\n【アクション】\n',
        isDefault: true,
      });

      expect(template.id).toBeNull();
      expect(template.userId).toBe('user-1');
      expect(template.name).toBe('読書メモ');
      expect(template.content).toBe('【学び】\n\n【アクション】\n');
      expect(template.isDefault).toBe(true);
      expect(template.created).toBeInstanceOf(Date);
      expect(template.updated).toBeInstanceOf(Date);
    });

    it('ユーザーIDが空の場合はエラー', () => {
      expect(() =>
        MemoTemplate.create({
          userId: '',
          name: 'テンプレート',
          content: '内容',
          isDefault: false,
        }),
      ).toThrow('ユーザーIDは必須です');
    });

    it('テンプレート名が空の場合はエラー', () => {
      expect(() =>
        MemoTemplate.create({
          userId: 'user-1',
          name: '  ',
          content: '内容',
          isDefault: false,
        }),
      ).toThrow('テンプレート名は必須です');
    });

    it('テンプレート名が120文字を超える場合はエラー', () => {
      expect(() =>
        MemoTemplate.create({
          userId: 'user-1',
          name: 'あ'.repeat(121),
          content: '内容',
          isDefault: false,
        }),
      ).toThrow('テンプレート名は120文字以内で入力してください');
    });

    it('テンプレート内容が空の場合はエラー', () => {
      expect(() =>
        MemoTemplate.create({
          userId: 'user-1',
          name: 'テンプレート',
          content: '',
          isDefault: false,
        }),
      ).toThrow('テンプレート内容は必須です');
    });
  });

  describe('update', () => {
    it('名前・内容・デフォルトフラグを更新できる', () => {
      const template = MemoTemplate.fromDatabase(
        '1',
        'user-1',
        '旧名',
        '旧内容',
        false,
        new Date('2025-01-01'),
        new Date('2025-01-01'),
      );

      template.update({
        name: '新名',
        content: '新内容',
        isDefault: true,
      });

      expect(template.name).toBe('新名');
      expect(template.content).toBe('新内容');
      expect(template.isDefault).toBe(true);
      expect(template.updated.getTime()).toBeGreaterThan(
        new Date('2025-01-01').getTime(),
      );
    });

    it('更新時も名前が空ならエラー', () => {
      const template = MemoTemplate.fromDatabase(
        '1',
        'user-1',
        '旧名',
        '旧内容',
        false,
        new Date(),
        new Date(),
      );

      expect(() =>
        template.update({ name: '', content: '内容', isDefault: false }),
      ).toThrow('テンプレート名は必須です');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const template = MemoTemplate.fromDatabase(
        '1',
        'user-1',
        'テンプレート名',
        '内容',
        true,
        created,
        updated,
      );

      expect(template.id).toBe('1');
      expect(template.userId).toBe('user-1');
      expect(template.name).toBe('テンプレート名');
      expect(template.content).toBe('内容');
      expect(template.isDefault).toBe(true);
      expect(template.created).toBe(created);
      expect(template.updated).toBe(updated);
    });
  });
});
