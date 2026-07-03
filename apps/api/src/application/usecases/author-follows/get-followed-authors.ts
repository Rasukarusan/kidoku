import { Injectable } from '@nestjs/common';
import { AuthorFollow } from '../../../domain/models/author-follow';
import { IAuthorFollowRepository } from '../../../domain/repositories/author-follow';

@Injectable()
export class GetFollowedAuthorsUseCase {
  constructor(
    private readonly authorFollowRepository: IAuthorFollowRepository,
  ) {}

  async execute(userId: string): Promise<AuthorFollow[]> {
    return await this.authorFollowRepository.findByUserId(userId);
  }
}
