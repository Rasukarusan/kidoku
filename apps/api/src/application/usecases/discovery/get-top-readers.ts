import { Injectable } from '@nestjs/common';
import { IDiscoveryRepository } from '../../../domain/repositories/discovery';
import { TopReader } from '../../../domain/types/social';

@Injectable()
export class GetTopReadersUseCase {
  constructor(private readonly discoveryRepository: IDiscoveryRepository) {}

  async execute(limit: number): Promise<TopReader[]> {
    return this.discoveryRepository.topReaders(limit);
  }
}
