import { Injectable } from '@nestjs/common';
import { ILikeRepository, LikeActor } from '../../../domain/repositories/like';

@Injectable()
export class UnlikeBookUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(actor: LikeActor, bookId: number): Promise<number> {
    await this.likeRepository.unlike(actor, bookId);
    return this.likeRepository.countByBook(bookId);
  }
}
