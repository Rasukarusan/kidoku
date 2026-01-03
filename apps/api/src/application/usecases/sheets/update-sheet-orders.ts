import { Injectable, NotFoundException } from '@nestjs/common';
import { ISheetRepository } from '../../../domain/repositories/sheet';

export interface SheetOrderInput {
  id: string;
  order: number;
}

@Injectable()
export class UpdateSheetOrdersUseCase {
  constructor(private readonly sheetRepository: ISheetRepository) {}

  async execute(userId: string, sheetOrders: SheetOrderInput[]): Promise<void> {
    const sheetsToUpdate = await Promise.all(
      sheetOrders.map(async ({ id, order }) => {
        const sheet = await this.sheetRepository.findById(id);

        if (!sheet || sheet.userId !== userId) {
          throw new NotFoundException(`シートが見つかりません: ${id}`);
        }

        sheet.updateOrder(order);
        return sheet;
      }),
    );

    await this.sheetRepository.saveAll(sheetsToUpdate);
  }
}
