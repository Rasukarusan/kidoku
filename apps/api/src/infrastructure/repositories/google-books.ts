import { Injectable } from '@nestjs/common';
import {
  IGoogleBooksRepository,
  GoogleBookItem,
} from '../../domain/repositories/google-books';

const NO_IMAGE = '/no-image.png';

@Injectable()
export class GoogleBooksRepository implements IGoogleBooksRepository {
  private readonly baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  async searchByTitle(query: string): Promise<GoogleBookItem[]> {
    const response = await fetch(
      `${this.baseUrl}?q=${encodeURIComponent(query)}`,
    );
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
          image:
            imageLinks?.thumbnail?.replace('http:', 'https:') || NO_IMAGE,
        };
      },
    );
  }
}
