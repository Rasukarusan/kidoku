import { Injectable } from '@nestjs/common';
import { ILikeRepository } from '../../../domain/repositories/like';

@Injectable()
export class UnlikeBookUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(userId: string, bookId: number): Promise<number> {
    await this.likeRepository.unlike(userId, bookId);
    return this.likeRepository.countByBook(bookId);
  }
}
