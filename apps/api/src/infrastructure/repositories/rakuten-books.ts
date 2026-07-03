import { Injectable, Logger } from '@nestjs/common';
import {
  IBookSearchRepository,
  BookSearchItem,
} from '../../domain/repositories/book-search';

const NO_IMAGE = '/no-image.png';
const RAKUTEN_BOOKS_API_URL =
  'https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404';

/** 楽天ブックスジャンルID（レベル2）→ジャンル名マッピング */
const GENRE_MAP: Record<string, string> = {
  '001001': '漫画（コミック）',
  '001002': '語学・学習参考書',
  '001003': '絵本・児童書・図鑑',
  '001004': '小説・エッセイ',
  '001005': 'パソコン・システム開発',
  '001006': 'ビジネス・経済・就職',
  '001007': '旅行・留学・アウトドア',
  '001008': '人文・思想・社会',
  '001009': 'ホビー・スポーツ・美術',
  '001010': '美容・暮らし・健康・料理',
  '001011': 'エンタメ・ゲーム',
  '001012': '科学・技術',
  '001013': '写真集・タレント',
  '001016': '資格・検定',
  '001017': 'ライトノベル',
  '001018': '楽譜',
  '001019': '文庫',
  '001020': '新書',
  '001028': '医学・薬学・看護学・歯科学',
};

/** ジャンルIDからジャンル名を取得（レベル2で引き当て） */
function resolveGenreName(genreId: string): string {
  const level2 = genreId.slice(0, 6);
  return GENRE_MAP[level2] || '-';
}

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
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    if (!applicationId || !accessKey) {
      this.logger.error(
        'RAKUTEN_APPLICATION_ID または RAKUTEN_ACCESS_KEY が設定されていません',
      );
      throw new Error('楽天ブックスAPIの設定が不足しています');
    }

    const params = new URLSearchParams({
      applicationId: applicationId.replace(/-/g, ''),
      accessKey,
      title: query,
      hits: '30',
      outOfStockFlag: '1',
    });

    const appUrl = process.env.RAKUTEN_APP_URL || 'https://kidoku.net';

    let response: Response;
    try {
      response = await fetch(`${RAKUTEN_BOOKS_API_URL}?${params.toString()}`, {
        headers: {
          Referer: appUrl,
          Origin: appUrl,
        },
      });
    } catch (error) {
      this.logger.error(
        `楽天ブックスAPIへの接続に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error('楽天ブックスAPIへの接続に失敗しました');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `楽天ブックスAPIがエラーを返しました: ${response.status} ${response.statusText} - ${errorBody}`,
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
      category: item.booksGenreId ? resolveGenreName(item.booksGenreId) : '-',
      image:
        item.largeImageUrl?.replace('http:', 'https:') ||
        item.mediumImageUrl?.replace('http:', 'https:') ||
        NO_IMAGE,
    }));
  }
}
