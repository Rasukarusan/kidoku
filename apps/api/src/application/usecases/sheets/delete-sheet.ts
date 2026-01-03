import { Injectable, NotFoundException } from '@nestjs/common';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class DeleteSheetUseCase {
  constructor(private readonly sheetRepository: ISheetRepository) {}

  async execute(userId: string, sheetId: string): Promise<void> {
    const sheet = await this.sheetRepository.findById(sheetId);

    if (!sheet || sheet.userId !== userId) {
      throw new NotFoundException('シートが見つかりません');
    }

    await this.sheetRepository.delete(sheetId);
  }
}
