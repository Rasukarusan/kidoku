import { Injectable } from '@nestjs/common';
import {
  IGoogleBooksRepository,
  GoogleBookItem,
} from '../../../domain/repositories/google-books';

@Injectable()
export class SearchGoogleBooksUseCase {
  constructor(
    private readonly googleBooksRepository: IGoogleBooksRepository,
  ) {}

  async execute(query: string): Promise<GoogleBookItem[]> {
    return await this.googleBooksRepository.searchByTitle(query);
  }
}
