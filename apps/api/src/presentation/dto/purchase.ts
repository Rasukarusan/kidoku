import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreatePurchaseInput {
  @Field(() => Int)
  bookId: number;

  @Field()
  @IsNotEmpty({ message: 'トランザクションダイジェストは必須です' })
  txDigest: string;

  @Field()
  @IsNotEmpty({ message: '送金元アドレスは必須です' })
  senderAddress: string;

  @Field()
  @IsNotEmpty({ message: 'ネットワークは必須です' })
  network: string;
}

@InputType()
export class GetPurchasedBookMemoInput {
  @Field(() => Int)
  bookId: number;
}

@InputType()
export class GetBookPaymentRecipientInput {
  @Field(() => Int)
  bookId: number;
}

@ObjectType()
export class PurchaseResponse {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  bookId: number;

  @Field()
  txDigest: string;

  @Field()
  network: string;

  @Field()
  amount: string;

  @Field()
  senderAddress: string;

  @Field()
  recipientAddress: string;

  @Field(() => GraphQLISODateTime)
  created: Date;
}
