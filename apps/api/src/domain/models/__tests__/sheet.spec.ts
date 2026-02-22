import { Sheet } from '../sheet';

describe('Sheet', () => {
  describe('create', () => {
    it('有効なパラメータでシートを作成できる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);

      expect(sheet.id).toBeNull();
      expect(sheet.userId).toBe('user-1');
      expect(sheet.name).toBe('マイシート');
      expect(sheet.order).toBe(0);
    });

    it('シート名が空の場合エラーになる', () => {
      expect(() => Sheet.create('user-1', '', 0)).toThrow('シート名は必須です');
    });

    it('シート名が空白のみの場合エラーになる', () => {
      expect(() => Sheet.create('user-1', '   ', 0)).toThrow(
        'シート名は必須です',
      );
    });

    it('シート名の前後空白がトリムされる', () => {
      const sheet = Sheet.create('user-1', '  マイシート  ', 0);
      expect(sheet.name).toBe('マイシート');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const updated = new Date('2025-01-02');
      const sheet = Sheet.fromDatabase(
        '1',
        'user-1',
        'マイシート',
        0,
        created,
        updated,
      );

      expect(sheet.id).toBe('1');
      expect(sheet.userId).toBe('user-1');
      expect(sheet.name).toBe('マイシート');
      expect(sheet.order).toBe(0);
      expect(sheet.created).toBe(created);
      expect(sheet.updated).toBe(updated);
    });
  });

  describe('rename', () => {
    it('シート名を変更できる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);
      sheet.rename('新しいシート名');
      expect(sheet.name).toBe('新しいシート名');
    });

    it('空のシート名に変更するとエラーになる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);
      expect(() => sheet.rename('')).toThrow('シート名は必須です');
    });

    it('空白のみのシート名に変更するとエラーになる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);
      expect(() => sheet.rename('   ')).toThrow('シート名は必須です');
    });

    it('シート名の前後空白がトリムされる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);
      sheet.rename('  新しいシート名  ');
      expect(sheet.name).toBe('新しいシート名');
    });
  });

  describe('updateOrder', () => {
    it('順序を変更できる', () => {
      const sheet = Sheet.create('user-1', 'マイシート', 0);
      sheet.updateOrder(5);
      expect(sheet.order).toBe(5);
    });
  });
});
