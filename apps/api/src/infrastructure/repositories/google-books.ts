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
  private readonly maxRetries = 3;

  private async fetchWithRetry(url: string): Promise<Response> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      let response: Response;
      try {
        response = await fetch(url);
      } catch (error) {
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `Google Books APIへの接続に失敗しました（試行${attempt + 1}/${this.maxRetries + 1}）。${delay}ms後にリトライします`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        this.logger.error(
          `Google Books APIへの接続に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new Error('Google Books APIへの接続に失敗しました');
      }

      if (response.status === 429 && attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(
          `Google Books APIレート制限（429）。${delay}ms後にリトライします（試行${attempt + 1}/${this.maxRetries + 1}）`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    }

    throw new Error('Google Books APIへの接続に失敗しました');
  }

  async searchByTitle(query: string): Promise<GoogleBookItem[]> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}?q=${encodeURIComponent(query)}`,
    );

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
