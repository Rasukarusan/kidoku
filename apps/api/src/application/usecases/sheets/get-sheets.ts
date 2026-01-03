import { Inject, Injectable } from '@nestjs/common';
import { Sheet } from 'src/domain/models/sheet';
import { ISheetRepository } from 'src/domain/repositories/sheet';

@Injectable()
export class GetSheetsUseCase {
  constructor(
    @Inject('ISheetRepository')
    private readonly sheetsRepository: ISheetRepository,
  ) {}

  async execute(userId: string): Promise<Sheet[]> {
    return await this.sheetsRepository.findByUserId(userId);
  }
}
