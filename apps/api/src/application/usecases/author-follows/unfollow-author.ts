import { Injectable, NotFoundException } from '@nestjs/common';
import { IAuthorFollowRepository } from '../../../domain/repositories/author-follow';

@Injectable()
export class UnfollowAuthorUseCase {
  constructor(
    private readonly authorFollowRepository: IAuthorFollowRepository,
  ) {}

  async execute(id: number, userId: string): Promise<void> {
    const follows = await this.authorFollowRepository.findByUserId(userId);
    if (!follows.some((follow) => follow.id === String(id))) {
      throw new NotFoundException('フォロー中の著者が見つかりません');
    }
    await this.authorFollowRepository.delete(id, userId);
  }
}
