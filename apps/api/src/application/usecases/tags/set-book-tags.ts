import { Injectable, NotFoundException } from '@nestjs/common';
import { ITagRepository } from '../../../domain/repositories/tag';
import { IBookRepository } from '../../../domain/repositories/book';

const MAX_TAGS_PER_BOOK = 20;

@Injectable()
export class SetBookTagsUseCase {
  constructor(
    private readonly tagRepository: ITagRepository,
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(params: {
    userId: string;
    bookId: number;
    tags: string[];
  }): Promise<string[]> {
    const book = await this.bookRepository.findById(String(params.bookId));
    if (!book || book.userId !== params.userId) {
      throw new NotFoundException('本が見つかりません');
    }
    const tags = params.tags.filter((tag) => tag.trim() !== '');
    if (tags.length > MAX_TAGS_PER_BOOK) {
      throw new Error(
        `タグは1冊につき${MAX_TAGS_PER_BOOK}個までしか設定できません`,
      );
    }
    return await this.tagRepository.replaceBookTags(
      params.bookId,
      params.userId,
      tags,
    );
  }
}
