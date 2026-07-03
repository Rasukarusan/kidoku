import { RatingAxis } from './rating-axis';

describe('RatingAxis', () => {
  describe('create', () => {
    it('新規評価軸を作成できる', () => {
      const axis = RatingAxis.create({
        userId: 'user-1',
        name: ' 没入度 ',
        order: 2,
      });
      expect(axis.id).toBeNull();
      expect(axis.name).toBe('没入度');
      expect(axis.order).toBe(2);
    });

    it('名前が空の場合はエラー', () => {
      expect(() => RatingAxis.create({ userId: 'user-1', name: '  ' })).toThrow(
        '評価軸の名前は必須です',
      );
    });

    it('名前が60文字を超える場合はエラー', () => {
      expect(() =>
        RatingAxis.create({ userId: 'user-1', name: 'あ'.repeat(61) }),
      ).toThrow('評価軸の名前は60文字以内で入力してください');
    });
  });

  describe('validateValue', () => {
    it('1〜5の整数は許可される', () => {
      expect(() => RatingAxis.validateValue(1)).not.toThrow();
      expect(() => RatingAxis.validateValue(5)).not.toThrow();
    });

    it('範囲外・非整数はエラー', () => {
      expect(() => RatingAxis.validateValue(0)).toThrow();
      expect(() => RatingAxis.validateValue(6)).toThrow();
      expect(() => RatingAxis.validateValue(3.5)).toThrow();
    });
  });
});
