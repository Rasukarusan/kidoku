import { Injectable } from '@nestjs/common';
import { ITagRepository } from '../../../domain/repositories/tag';
import { TaggedBook } from '../../../domain/types/tag';

@Injectable()
export class GetBooksByTagUseCase {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(userId: string, tagName: string): Promise<TaggedBook[]> {
    return await this.tagRepository.findBooksByTagName(userId, tagName);
  }
}
