import { Injectable } from '@nestjs/common';
import { Sheet } from '../../../domain/models/sheet';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class CreateSheetUseCase {
  constructor(private readonly sheetRepository: ISheetRepository) {}

  async execute(userId: string, name: string): Promise<Sheet> {
    const lastSheet = await this.sheetRepository.findLastByUserId(userId);
    const order = lastSheet ? lastSheet.order + 1 : 1;

    const sheet = Sheet.create(userId, name, order);
    return await this.sheetRepository.save(sheet);
  }
}
