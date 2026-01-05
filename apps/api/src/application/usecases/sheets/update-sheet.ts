import { Injectable, NotFoundException } from '@nestjs/common';
import { Sheet } from '../../../domain/models/sheet';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class UpdateSheetUseCase {
  constructor(private readonly sheetRepository: ISheetRepository) {}

  async execute(
    userId: string,
    sheetId: string,
    newName: string,
  ): Promise<Sheet> {
    const sheet = await this.sheetRepository.findById(sheetId);

    if (!sheet || sheet.userId !== userId) {
      throw new NotFoundException('シートが見つかりません');
    }

    sheet.rename(newName);
    return await this.sheetRepository.save(sheet);
  }
}
