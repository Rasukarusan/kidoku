import { Injectable } from '@nestjs/common';
import { IDiscoveryRepository } from '../../../domain/repositories/discovery';
import { PopularBook } from '../../../domain/types/social';

@Injectable()
export class GetPopularBooksUseCase {
  constructor(private readonly discoveryRepository: IDiscoveryRepository) {}

  async execute(limit: number): Promise<PopularBook[]> {
    return this.discoveryRepository.weeklyPopularBooks(limit);
  }
}
