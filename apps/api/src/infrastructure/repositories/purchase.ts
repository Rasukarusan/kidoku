import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Purchase } from '../../domain/models/purchase';
import { IPurchaseRepository } from '../../domain/repositories/purchase';

@Injectable()
export class PurchaseRepository implements IPurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(purchase: Purchase): Promise<Purchase> {
    const row = await this.prisma.purchase.create({
      data: {
        userId: purchase.userId,
        bookId: purchase.bookId,
        txDigest: purchase.txDigest,
        network: purchase.network,
        amount: purchase.amount,
        senderAddress: purchase.senderAddress,
        recipientAddress: purchase.recipientAddress,
      },
    });
    return this.toEntity(row);
  }

  async findByUserAndBook(
    userId: string,
    bookId: number,
  ): Promise<Purchase | null> {
    const row = await this.prisma.purchase.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByTxDigest(txDigest: string): Promise<Purchase | null> {
    const row = await this.prisma.purchase.findUnique({
      where: { txDigest },
    });
    return row ? this.toEntity(row) : null;
  }

  async findBookIdsByUser(userId: string): Promise<number[]> {
    const rows = await this.prisma.purchase.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return rows.map((r) => r.bookId);
  }

  private toEntity(row: {
    id: number;
    userId: string;
    bookId: number;
    txDigest: string;
    network: string;
    amount: string;
    senderAddress: string;
    recipientAddress: string;
    created: Date;
  }): Purchase {
    return Purchase.fromDatabase(
      row.id.toString(),
      row.userId,
      row.bookId,
      row.txDigest,
      row.network,
      row.amount,
      row.senderAddress,
      row.recipientAddress,
      row.created ?? new Date(),
    );
  }
}
