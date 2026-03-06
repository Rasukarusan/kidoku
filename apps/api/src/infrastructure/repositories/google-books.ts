import { Injectable, Logger } from '@nestjs/common';
import {
  IGoogleBooksRepository,
  GoogleBookItem,
} from '../../domain/repositories/google-books';

const NO_IMAGE = '/no-image.png';

@Injectable()
export class GoogleBooksRepository implements IGoogleBooksRepository {
  private readonly baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly logger = new Logger(GoogleBooksRepository.name);

  async searchByTitle(query: string): Promise<GoogleBookItem[]> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(query)}`);
    } catch (error) {
      this.logger.error(
        `Google Books APIへの接続に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error('Google Books APIへの接続に失敗しました');
    }

    if (!response.ok) {
      this.logger.error(
        `Google Books APIがエラーを返しました: ${response.status} ${response.statusText}`,
      );
      throw new Error(
        `Google Books APIがエラーを返しました（ステータス: ${response.status}）`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map(
      (item: {
        id: string;
        volumeInfo: {
          title?: string;
          authors?: string[];
          categories?: string[];
          imageLinks?: { thumbnail?: string };
        };
      }) => {
        const { title, authors, categories, imageLinks } = item.volumeInfo;
        return {
          id: item.id,
          title: title || '',
          author: Array.isArray(authors) ? authors.join(',') : '-',
          category: categories ? categories.join(',') : '-',
          image: imageLinks?.thumbnail?.replace('http:', 'https:') || NO_IMAGE,
        };
      },
    );
  }
}
