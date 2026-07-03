import { Injectable, NotFoundException } from '@nestjs/common';
import { IReReadingRepository } from '../../../domain/repositories/re-reading';

@Injectable()
export class DeleteReReadingUseCase {
  constructor(private readonly reReadingRepository: IReReadingRepository) {}

  async execute(id: number, userId: string): Promise<void> {
    const reReading = await this.reReadingRepository.findById(id, userId);
    if (!reReading) {
      throw new NotFoundException('再読の記録が見つかりません');
    }
    await this.reReadingRepository.delete(id, userId);
  }
}
