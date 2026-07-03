import { Injectable } from '@nestjs/common';
import { AuthorFollow } from '../../../domain/models/author-follow';
import { IAuthorFollowRepository } from '../../../domain/repositories/author-follow';

const MAX_FOLLOWS_PER_USER = 50;

@Injectable()
export class FollowAuthorUseCase {
  constructor(
    private readonly authorFollowRepository: IAuthorFollowRepository,
  ) {}

  async execute(params: {
    userId: string;
    authorName: string;
  }): Promise<AuthorFollow> {
    const follow = AuthorFollow.create(params);
    const existing = await this.authorFollowRepository.findByUserIdAndName(
      params.userId,
      follow.authorName,
    );
    if (existing) {
      return existing;
    }
    const all = await this.authorFollowRepository.findByUserId(params.userId);
    if (all.length >= MAX_FOLLOWS_PER_USER) {
      throw new Error(`フォローできる著者は${MAX_FOLLOWS_PER_USER}人までです`);
    }
    return await this.authorFollowRepository.save(follow);
  }
}
