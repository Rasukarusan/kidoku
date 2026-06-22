import { Injectable } from '@nestjs/common';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';

@Injectable()
export class DeleteBookCommentUseCase {
  constructor(private readonly bookCommentRepository: IBookCommentRepository) {}

  async execute(userId: string, commentId: number): Promise<boolean> {
    return this.bookCommentRepository.delete(commentId, userId);
  }
}
