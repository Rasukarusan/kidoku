import { Injectable } from '@nestjs/common';
import { ITagRepository } from '../../../domain/repositories/tag';
import { TagWithCount } from '../../../domain/types/tag';

@Injectable()
export class GetMyTagsUseCase {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(userId: string): Promise<TagWithCount[]> {
    return await this.tagRepository.findByUserIdWithCount(userId);
  }
}
