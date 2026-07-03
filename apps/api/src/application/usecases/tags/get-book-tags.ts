import { Injectable } from '@nestjs/common';
import { ITagRepository } from '../../../domain/repositories/tag';

@Injectable()
export class GetBookTagsUseCase {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(bookId: number, userId: string): Promise<string[]> {
    return await this.tagRepository.findNamesByBookId(bookId, userId);
  }
}
