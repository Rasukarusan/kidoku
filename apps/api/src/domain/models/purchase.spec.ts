import { Purchase } from './purchase';

describe('Purchase', () => {
  const validParams = {
    userId: 'user-1',
    bookId: 1,
    txDigest: 'A1b2C3d4E5f6G7h8',
    network: 'testnet',
    amount: '10000000',
    senderAddress: '0xabc123',
    recipientAddress: '0xdef456',
  };

  describe('create', () => {
    it('有効なパラメータで購入を作成できる', () => {
      const purchase = Purchase.create(validParams);

      expect(purchase.id).toBeNull();
      expect(purchase.userId).toBe('user-1');
      expect(purchase.bookId).toBe(1);
      expect(purchase.txDigest).toBe('A1b2C3d4E5f6G7h8');
      expect(purchase.network).toBe('testnet');
      expect(purchase.amount).toBe('10000000');
      expect(purchase.senderAddress).toBe('0xabc123');
      expect(purchase.recipientAddress).toBe('0xdef456');
      expect(purchase.created).toBeInstanceOf(Date);
    });

    it('txDigestの前後空白がトリムされる', () => {
      const purchase = Purchase.create({
        ...validParams,
        txDigest: '  digest  ',
      });
      expect(purchase.txDigest).toBe('digest');
    });

    it('bookIdが0以下の場合エラーになる', () => {
      expect(() => Purchase.create({ ...validParams, bookId: 0 })).toThrow(
        '書籍IDが不正です',
      );
    });

    it('txDigestが空の場合エラーになる', () => {
      expect(() => Purchase.create({ ...validParams, txDigest: '' })).toThrow(
        'トランザクションダイジェストは必須です',
      );
    });

    it('サポート外ネットワークの場合エラーになる', () => {
      expect(() =>
        Purchase.create({ ...validParams, network: 'ethereum' }),
      ).toThrow('サポートされていないネットワークです: ethereum');
    });

    it('金額が0以下の場合エラーになる', () => {
      expect(() => Purchase.create({ ...validParams, amount: '0' })).toThrow(
        '決済金額が不正です',
      );
    });

    it('金額が数値でない場合エラーになる', () => {
      expect(() => Purchase.create({ ...validParams, amount: 'abc' })).toThrow(
        '決済金額が不正です',
      );
    });

    it('送金元アドレスが不正な場合エラーになる', () => {
      expect(() =>
        Purchase.create({ ...validParams, senderAddress: 'invalid' }),
      ).toThrow('送金元アドレスが不正です');
    });

    it('送金先アドレスが不正な場合エラーになる', () => {
      expect(() =>
        Purchase.create({ ...validParams, recipientAddress: 'invalid' }),
      ).toThrow('送金先アドレスが不正です');
    });
  });

  describe('fromDatabase', () => {
    it('DBからの復元ができる', () => {
      const created = new Date('2025-01-01');
      const purchase = Purchase.fromDatabase(
        '1',
        'user-1',
        2,
        'digest',
        'testnet',
        '10000000',
        '0xabc',
        '0xdef',
        created,
      );

      expect(purchase.id).toBe('1');
      expect(purchase.bookId).toBe(2);
      expect(purchase.created).toBe(created);
    });
  });
});
