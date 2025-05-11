import { Injectable } from '@nestjs/common';
import { SheetsRepository } from '../../../infrastructure/repositories/sheets.repository';
import { Sheet } from '../models/sheet.model';

@Injectable()
export class GetSheetsUseCase {
  constructor(private readonly sheetsRepository: SheetsRepository) {}

  async execute(userId: string): Promise<Sheet[]> {
    const sheets = await this.sheetsRepository.findByUserId(userId);
    return sheets;
  }
}
