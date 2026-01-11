import { Injectable } from '@nestjs/common';
import {
  ISearchRepository,
  SearchResult,
} from '../../../domain/repositories/search';

@Injectable()
export class SearchBooksUseCase {
  constructor(private readonly searchRepository: ISearchRepository) {}

  async execute(query: string, page = 1): Promise<SearchResult> {
    return await this.searchRepository.search(query, page);
  }
}
