import { Module } from '@nestjs/common';
import { PurchaseResolver } from '../resolvers/purchase';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { CreatePurchaseUseCase } from '../../application/usecases/purchases/create-purchase';
import { GetMyPurchasedBookIdsUseCase } from '../../application/usecases/purchases/get-my-purchased-book-ids';
import { GetPurchasedBookMemoUseCase } from '../../application/usecases/purchases/get-purchased-book-memo';
import { GetBookPaymentRecipientUseCase } from '../../application/usecases/purchases/get-book-payment-recipient';
import { PurchaseRepository } from '../../infrastructure/repositories/purchase';
import { BookRepository } from '../../infrastructure/repositories/book';
import { UserRepository } from '../../infrastructure/repositories/user';
import { SuiPaymentVerifier } from '../../infrastructure/sui/sui-payment-verifier';
import { IPurchaseRepository } from '../../domain/repositories/purchase';
import { IBookRepository } from '../../domain/repositories/book';
import { IUserRepository } from '../../domain/repositories/user';
import { IPaymentVerifier } from '../../domain/services/payment-verifier';

@Module({
  imports: [AuthModule],
  providers: [
    PurchaseResolver,
    CreatePurchaseUseCase,
    GetMyPurchasedBookIdsUseCase,
    GetPurchasedBookMemoUseCase,
    GetBookPaymentRecipientUseCase,
    {
      provide: IPurchaseRepository,
      useClass: PurchaseRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IPaymentVerifier,
      useClass: SuiPaymentVerifier,
    },
  ],
})
export class PurchaseModule {}
