import { Injectable } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class CreateBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(params: {
    userId: string;
    sheetId: number;
    title: string;
    author: string;
    category: string;
    image: string;
    impression: string;
    memo: string;
    isPublicMemo: boolean;
    isPurchasable?: boolean;
    finished: Date | null;
  }): Promise<Book> {
    const book = Book.create(params);
    return await this.bookRepository.save(book);
  }
}
