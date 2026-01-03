import { Injectable } from '@nestjs/common';
import { Comment } from '../../../domain/models/comment';
import { ICommentRepository } from '../../../domain/repositories/comment';
import { PaginatedResult } from '../../../domain/types/paginated-result';

@Injectable()
export class GetPublicCommentsUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(): Promise<PaginatedResult<Comment>> {
    return await this.commentRepository.findPublicComments();
  }
}
