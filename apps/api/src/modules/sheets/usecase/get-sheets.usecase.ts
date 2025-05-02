import { Injectable } from '@nestjs/common';
import { SheetsRepository } from '../../../infrastructure/repositories/sheets.repository';
import { GetSheetsResponseDto } from '../dto/get-sheets-response.dto';

@Injectable()
export class GetSheetsUseCase {
  constructor(private readonly sheetsRepository: SheetsRepository) {}

  async execute(userId: string): Promise<GetSheetsResponseDto> {
    const sheets = await this.sheetsRepository.findByUserId(userId);
    console.log(sheets);
    return { sheets };
  }
}
