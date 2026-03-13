import { Injectable, Logger } from '@nestjs/common';
import {
  IBookSearchRepository,
  BookSearchItem,
} from '../../domain/repositories/book-search';

const NO_IMAGE = '/no-image.png';
const RAKUTEN_BOOKS_API_URL =
  'https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404';

interface RakutenBookResponse {
  Items: Array<{
    Item: {
      isbn: string;
      title: string;
      author: string;
      booksGenreId: string;
      largeImageUrl: string;
      mediumImageUrl: string;
    };
  }>;
}

@Injectable()
export class RakutenBooksRepository implements IBookSearchRepository {
  private readonly logger = new Logger(RakutenBooksRepository.name);

  async searchByTitle(query: string): Promise<BookSearchItem[]> {
    const applicationId = process.env.RAKUTEN_APPLICATION_ID;
    if (!applicationId) {
      this.logger.error('RAKUTEN_APPLICATION_ID が設定されていません');
      throw new Error('楽天ブックスAPIの設定が不足しています');
    }

    const params = new URLSearchParams({
      applicationId,
      title: query,
      hits: '30',
      outOfStockFlag: '1',
    });

    let response: Response;
    try {
      response = await fetch(`${RAKUTEN_BOOKS_API_URL}?${params.toString()}`);
    } catch (error) {
      this.logger.error(
        `楽天ブックスAPIへの接続に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error('楽天ブックスAPIへの接続に失敗しました');
    }

    if (!response.ok) {
      this.logger.error(
        `楽天ブックスAPIがエラーを返しました: ${response.status} ${response.statusText}`,
      );
      throw new Error(
        `楽天ブックスAPIがエラーを返しました（ステータス: ${response.status}）`,
      );
    }

    const data = (await response.json()) as RakutenBookResponse;

    if (!data.Items || data.Items.length === 0) return [];

    return data.Items.map(({ Item: item }) => ({
      id: item.isbn || '',
      title: item.title || '',
      author: item.author || '-',
      category: item.booksGenreId || '-',
      image:
        item.largeImageUrl?.replace('http:', 'https:') ||
        item.mediumImageUrl?.replace('http:', 'https:') ||
        NO_IMAGE,
    }));
  }
}
