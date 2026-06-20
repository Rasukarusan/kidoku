import { CreatePurchaseUseCase } from './create-purchase';
import { IPurchaseRepository } from '../../../domain/repositories/purchase';
import { IBookRepository } from '../../../domain/repositories/book';
import { IUserRepository } from '../../../domain/repositories/user';
import { IPaymentVerifier } from '../../../domain/services/payment-verifier';
import { Book } from '../../../domain/models/book';
import { Purchase } from '../../../domain/models/purchase';
import { User } from '../../../domain/models/user';

describe('CreatePurchaseUseCase', () => {
  let useCase: CreatePurchaseUseCase;
  let purchaseRepository: jest.Mocked<IPurchaseRepository>;
  let bookRepository: jest.Mocked<IBookRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let paymentVerifier: jest.Mocked<IPaymentVerifier>;

  const owner = User.fromDatabase(
    'owner-1',
    '出品者',
    'owner@example.com',
    null,
    false,
    '0xcafe',
  );

  const purchasableBook = Book.fromDatabase(
    '1',
    'owner-1',
    1,
    'タイトル',
    '著者',
    'カテゴリ',
    'image.jpg',
    '★',
    '秘密のメモ',
    false,
    true, // isPurchasable
    null,
    new Date(),
    new Date(),
  );

  const baseParams = {
    userId: 'buyer-1',
    bookId: 1,
    txDigest: 'digest-1',
    senderAddress: '0xbeef',
    network: 'testnet',
  };

  beforeEach(() => {
    purchaseRepository = {
      create: jest.fn(),
      findByUserAndBook: jest.fn(),
      findByTxDigest: jest.fn(),
      findBookIdsByUser: jest.fn(),
    };
    bookRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    paymentVerifier = {
      verify: jest.fn(),
    };
    // 既定で所有者は受取アドレス登録済み
    userRepository.findById.mockResolvedValue(owner);
    useCase = new CreatePurchaseUseCase(
      purchaseRepository,
      bookRepository,
      userRepository,
      paymentVerifier,
    );
  });

  it('検証に成功すると購入を作成する', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(null);
    purchaseRepository.findByTxDigest.mockResolvedValue(null);
    paymentVerifier.verify.mockResolvedValue({
      valid: true,
      amountReceived: 10000000n,
      recipient: '0xcafe',
      sender: '0xbeef',
    });
    const saved = Purchase.create({
      userId: 'buyer-1',
      bookId: 1,
      txDigest: 'digest-1',
      network: 'testnet',
      amount: '10000000',
      senderAddress: '0xbeef',
      recipientAddress: '0xcafe',
    });
    purchaseRepository.create.mockResolvedValue(saved);

    const result = await useCase.execute(baseParams);

    expect(result).toBe(saved);
    expect(purchaseRepository.create).toHaveBeenCalledTimes(1);
  });

  it('本ごとに価格が設定されている場合、その額を期待送金額として検証する', async () => {
    const pricedBook = Book.fromDatabase(
      '1',
      'owner-1',
      1,
      'タイトル',
      '著者',
      'カテゴリ',
      'image.jpg',
      '★',
      '秘密のメモ',
      false,
      true, // isPurchasable
      null,
      new Date(),
      new Date(),
      '50000000', // price (0.05 SUI)
    );
    bookRepository.findById.mockResolvedValue(pricedBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(null);
    purchaseRepository.findByTxDigest.mockResolvedValue(null);
    paymentVerifier.verify.mockResolvedValue({
      valid: true,
      amountReceived: 50000000n,
      recipient: '0xcafe',
      sender: '0xbeef',
    });
    purchaseRepository.create.mockImplementation((p) => Promise.resolve(p));

    await useCase.execute(baseParams);

    expect(paymentVerifier.verify).toHaveBeenCalledWith(
      expect.objectContaining({ expectedAmount: 50000000n }),
    );
  });

  it('価格未設定の場合、expectedAmountは渡さない（既定額を使用）', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(null);
    purchaseRepository.findByTxDigest.mockResolvedValue(null);
    paymentVerifier.verify.mockResolvedValue({
      valid: true,
      amountReceived: 10000000n,
      recipient: '0xcafe',
      sender: '0xbeef',
    });
    purchaseRepository.create.mockImplementation((p) => Promise.resolve(p));

    await useCase.execute(baseParams);

    expect(paymentVerifier.verify).toHaveBeenCalledWith(
      expect.objectContaining({ expectedAmount: undefined }),
    );
  });

  it('書籍が存在しない場合エラーになる', async () => {
    bookRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(baseParams)).rejects.toThrow(
      '書籍が見つかりません',
    );
  });

  it('購入対象でない書籍の場合エラーになる', async () => {
    const notPurchasable = Book.fromDatabase(
      '1',
      'owner-1',
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
      new Date(),
      new Date(),
    );
    bookRepository.findById.mockResolvedValue(notPurchasable);
    await expect(useCase.execute(baseParams)).rejects.toThrow(
      'この書籍は購入対象ではありません',
    );
  });

  it('自分の書籍は購入できない', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    await expect(
      useCase.execute({ ...baseParams, userId: 'owner-1' }),
    ).rejects.toThrow('自分の書籍は購入できません');
  });

  it('出品者が受取アドレス未登録の場合エラーになる', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    userRepository.findById.mockResolvedValue(
      User.fromDatabase('owner-1', '出品者', null, null, false, null),
    );
    await expect(useCase.execute(baseParams)).rejects.toThrow(
      '出品者が受取アドレスを設定していないため購入できません',
    );
  });

  it('購入済みの場合は既存の購入を返す（冪等）', async () => {
    const existing = Purchase.create({
      userId: 'buyer-1',
      bookId: 1,
      txDigest: 'old-digest',
      network: 'testnet',
      amount: '10000000',
      senderAddress: '0xbeef',
      recipientAddress: '0xcafe',
    });
    bookRepository.findById.mockResolvedValue(purchasableBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(existing);

    const result = await useCase.execute(baseParams);

    expect(result).toBe(existing);
    expect(paymentVerifier.verify).not.toHaveBeenCalled();
    expect(purchaseRepository.create).not.toHaveBeenCalled();
  });

  it('トランザクションが既に使用済みの場合エラーになる', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(null);
    purchaseRepository.findByTxDigest.mockResolvedValue(
      Purchase.create({
        userId: 'other',
        bookId: 1,
        txDigest: 'digest-1',
        network: 'testnet',
        amount: '10000000',
        senderAddress: '0xdead',
        recipientAddress: '0xcafe',
      }),
    );
    await expect(useCase.execute(baseParams)).rejects.toThrow(
      'このトランザクションは既に使用されています',
    );
  });

  it('検証に失敗した場合エラーになる', async () => {
    bookRepository.findById.mockResolvedValue(purchasableBook);
    purchaseRepository.findByUserAndBook.mockResolvedValue(null);
    purchaseRepository.findByTxDigest.mockResolvedValue(null);
    paymentVerifier.verify.mockResolvedValue({
      valid: false,
      reason: '送金額が不足しています',
    });
    await expect(useCase.execute(baseParams)).rejects.toThrow(
      '決済の検証に失敗しました: 送金額が不足しています',
    );
  });
});
