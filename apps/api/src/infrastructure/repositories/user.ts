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
    return User.fromDatabase(row.id, row.name, row.email, row.image, row.admin);
  }

  async findByName(name: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { name },
    });
    if (!row) return null;
    return User.fromDatabase(row.id, row.name, row.email, row.image, row.admin);
  }

  async updateName(id: string, name: string): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { name },
    });
    return User.fromDatabase(row.id, row.name, row.email, row.image, row.admin);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
