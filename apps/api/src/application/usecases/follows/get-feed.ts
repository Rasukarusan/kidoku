import { Injectable } from '@nestjs/common';
import { IFollowRepository } from '../../../domain/repositories/follow';
import { PaginatedResult } from '../../../domain/types/paginated-result';
import { FeedBook } from '../../../domain/types/social';

@Injectable()
export class GetFeedUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<FeedBook>> {
    return this.followRepository.getFeedBooks(userId, limit, offset);
  }
}
