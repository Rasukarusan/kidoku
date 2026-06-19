import { Module } from '@nestjs/common';
import { PurchaseResolver } from '../resolvers/purchase';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { CreatePurchaseUseCase } from '../../application/usecases/purchases/create-purchase';
import { GetMyPurchasedBookIdsUseCase } from '../../application/usecases/purchases/get-my-purchased-book-ids';
import { GetPurchasedBookMemoUseCase } from '../../application/usecases/purchases/get-purchased-book-memo';
import { PurchaseRepository } from '../../infrastructure/repositories/purchase';
import { BookRepository } from '../../infrastructure/repositories/book';
import { SuiPaymentVerifier } from '../../infrastructure/sui/sui-payment-verifier';
import { IPurchaseRepository } from '../../domain/repositories/purchase';
import { IBookRepository } from '../../domain/repositories/book';
import { IPaymentVerifier } from '../../domain/services/payment-verifier';

@Module({
  imports: [AuthModule],
  providers: [
    PurchaseResolver,
    CreatePurchaseUseCase,
    GetMyPurchasedBookIdsUseCase,
    GetPurchasedBookMemoUseCase,
    {
      provide: IPurchaseRepository,
      useClass: PurchaseRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
    {
      provide: IPaymentVerifier,
      useClass: SuiPaymentVerifier,
    },
  ],
})
export class PurchaseModule {}
