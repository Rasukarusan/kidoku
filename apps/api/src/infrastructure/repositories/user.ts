import { Prisma } from '@prisma/client';
import { deleteOwnedItems } from '../database/delete-owned-items';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User } from '../../domain/models/user';
import { IUserRepository } from '../../domain/repositories/user';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!row) return null;
    return User.fromDatabase(
      row.id,
      row.name,
      row.email,
      row.image,
      row.admin,
      row.suiAddress,
    );
  }

  async findByName(name: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { name },
    });
    if (!row) return null;
    return User.fromDatabase(
      row.id,
      row.name,
      row.email,
      row.image,
      row.admin,
      row.suiAddress,
    );
  }

  async updateName(id: string, name: string): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { name },
    });
    return User.fromDatabase(
      row.id,
      row.name,
      row.email,
      row.image,
      row.admin,
      row.suiAddress,
    );
  }

  async updateSuiAddress(id: string, address: string | null): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { suiAddress: address },
    });
    return User.fromDatabase(
      row.id,
      row.name,
      row.email,
      row.image,
      row.admin,
      row.suiAddress,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const items = await tx.item.findMany({
          where: { userId: id },
          select: { id: true },
        });
        await deleteOwnedItems(
          tx,
          id,
          items.map((item) => item.id),
        );
        await tx.itemTemplate.deleteMany({ where: { userId: id } });
        await tx.aiSummaries.deleteMany({ where: { userId: id } });
        await tx.collection.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
