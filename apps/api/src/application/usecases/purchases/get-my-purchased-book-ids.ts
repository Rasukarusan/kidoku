import { Injectable } from '@nestjs/common';
import { IPurchaseRepository } from '../../../domain/repositories/purchase';

@Injectable()
export class GetMyPurchasedBookIdsUseCase {
  constructor(private readonly purchaseRepository: IPurchaseRepository) {}

  async execute(userId: string): Promise<number[]> {
    return this.purchaseRepository.findBookIdsByUser(userId);
  }
}
