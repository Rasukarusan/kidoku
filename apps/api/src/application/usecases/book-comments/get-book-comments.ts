import { Injectable } from '@nestjs/common';
import { BookComment } from '../../../domain/models/book-comment';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';
import { PaginatedResult } from '../../../domain/types/paginated-result';

@Injectable()
export class GetBookCommentsUseCase {
  constructor(private readonly bookCommentRepository: IBookCommentRepository) {}

  async execute(
    bookId: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<BookComment>> {
    return this.bookCommentRepository.findByBook(bookId, limit, offset);
  }
}
