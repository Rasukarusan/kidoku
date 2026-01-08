import { Injectable } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class GetBooksUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(params: {
    userId?: string;
    sheetId?: number;
  }): Promise<Book[]> {
    if (params.userId && params.sheetId) {
      return await this.bookRepository.findByUserIdAndSheetId(
        params.userId,
        params.sheetId,
      );
    } else if (params.userId) {
      return await this.bookRepository.findByUserId(params.userId);
    } else if (params.sheetId) {
      return await this.bookRepository.findBySheetId(params.sheetId);
    }

    return [];
  }
}
