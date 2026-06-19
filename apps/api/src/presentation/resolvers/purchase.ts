import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { CreatePurchaseUseCase } from '../../application/usecases/purchases/create-purchase';
import { GetMyPurchasedBookIdsUseCase } from '../../application/usecases/purchases/get-my-purchased-book-ids';
import { GetPurchasedBookMemoUseCase } from '../../application/usecases/purchases/get-purchased-book-memo';
import { Purchase } from '../../domain/models/purchase';
import {
  CreatePurchaseInput,
  GetPurchasedBookMemoInput,
  PurchaseResponse,
} from '../dto/purchase';

@Resolver()
@UseGuards(GqlAuthGuard)
export class PurchaseResolver {
  constructor(
    private readonly createPurchaseUseCase: CreatePurchaseUseCase,
    private readonly getMyPurchasedBookIdsUseCase: GetMyPurchasedBookIdsUseCase,
    private readonly getPurchasedBookMemoUseCase: GetPurchasedBookMemoUseCase,
  ) {}

  @Mutation(() => PurchaseResponse)
  async createPurchase(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreatePurchaseInput,
  ): Promise<PurchaseResponse> {
    const purchase = await this.createPurchaseUseCase.execute({
      userId: user.id,
      bookId: input.bookId,
      txDigest: input.txDigest,
      senderAddress: input.senderAddress,
      network: input.network,
    });
    return this.toResponse(purchase);
  }

  @Query(() => [Int])
  async myPurchasedBookIds(
    @CurrentUser() user: { id: string },
  ): Promise<number[]> {
    return this.getMyPurchasedBookIdsUseCase.execute(user.id);
  }

  @Query(() => String, { nullable: true })
  async purchasedBookMemo(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetPurchasedBookMemoInput,
  ): Promise<string | null> {
    return this.getPurchasedBookMemoUseCase.execute(user.id, input.bookId);
  }

  private toResponse(purchase: Purchase): PurchaseResponse {
    return {
      id: purchase.id ?? '',
      bookId: purchase.bookId,
      txDigest: purchase.txDigest,
      network: purchase.network,
      amount: purchase.amount,
      senderAddress: purchase.senderAddress,
      recipientAddress: purchase.recipientAddress,
      created: purchase.created,
    };
  }
}
