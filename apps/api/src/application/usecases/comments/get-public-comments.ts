import { Injectable } from '@nestjs/common';
import { Comment } from 'src/domain/models/comment';
import { ICommentRepository } from 'src/domain/repositories/comment';
import { PaginatedResult } from 'src/domain/types/paginated-result';

@Injectable()
export class GetPublicCommentsUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(): Promise<PaginatedResult<Comment>> {
    return await this.commentRepository.findPublicComments();
  }
}
