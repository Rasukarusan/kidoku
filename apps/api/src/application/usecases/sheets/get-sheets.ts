import { Injectable } from '@nestjs/common';
import { Sheet } from '../../../domain/models/sheet';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class GetSheetsUseCase {
  constructor(private readonly sheetsRepository: ISheetRepository) {}

  async execute(userId: string): Promise<Sheet[]> {
    return await this.sheetsRepository.findByUserId(userId);
  }
}
