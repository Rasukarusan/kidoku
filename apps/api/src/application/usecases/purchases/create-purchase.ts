import { Injectable } from '@nestjs/common';
import { Purchase } from '../../../domain/models/purchase';
import { IPurchaseRepository } from '../../../domain/repositories/purchase';
import { IBookRepository } from '../../../domain/repositories/book';
import { IUserRepository } from '../../../domain/repositories/user';
import { IPaymentVerifier } from '../../../domain/services/payment-verifier';

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository,
    private readonly paymentVerifier: IPaymentVerifier,
  ) {}

  async execute(params: {
    userId: string;
    bookId: number;
    txDigest: string;
    senderAddress: string;
    network: string;
  }): Promise<Purchase> {
    const book = await this.bookRepository.findById(String(params.bookId));
    if (!book) {
      throw new Error('書籍が見つかりません');
    }
    if (!book.isPurchasable) {
      throw new Error('この書籍は購入対象ではありません');
    }
    if (book.userId === params.userId) {
      throw new Error('自分の書籍は購入できません');
    }

    // 送金先は本の所有者の受取アドレス。未登録なら購入不可
    const owner = await this.userRepository.findById(book.userId);
    if (!owner?.suiAddress) {
      throw new Error('出品者が受取アドレスを設定していないため購入できません');
    }

    // すでに購入済みなら冪等にそのまま返す
    const existing = await this.purchaseRepository.findByUserAndBook(
      params.userId,
      params.bookId,
    );
    if (existing) {
      return existing;
    }

    // 同一トランザクションの二重利用を防ぐ
    const duplicated = await this.purchaseRepository.findByTxDigest(
      params.txDigest,
    );
    if (duplicated) {
      throw new Error('このトランザクションは既に使用されています');
    }

    // ブロックチェーン上で実際に決済が成立しているか検証する
    const result = await this.paymentVerifier.verify({
      txDigest: params.txDigest,
      senderAddress: params.senderAddress,
      network: params.network,
      expectedRecipient: owner.suiAddress,
    });
    if (!result.valid) {
      throw new Error(`決済の検証に失敗しました: ${result.reason ?? '不明'}`);
    }

    const purchase = Purchase.create({
      userId: params.userId,
      bookId: params.bookId,
      txDigest: params.txDigest,
      network: params.network,
      amount: (result.amountReceived ?? 0n).toString(),
      senderAddress: result.sender ?? params.senderAddress,
      recipientAddress: result.recipient ?? '',
    });

    return this.purchaseRepository.create(purchase);
  }
}
