import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class GetBookQuotesInput {
  @Field(() => Int)
  bookId: number;
}

@InputType()
export class CreateQuoteInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field()
  text: string;

  @Field({ nullable: true })
  comment?: string | null;
}

@InputType()
export class UpdateQuoteInput {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field()
  text: string;

  @Field({ nullable: true })
  comment?: string | null;
}

@InputType()
export class DeleteQuoteInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class QuoteResponse {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  bookId: number;

  @Field(() => Int, { nullable: true })
  page: number | null;

  @Field()
  text: string;

  @Field({ nullable: true })
  comment: string | null;

  @Field(() => GraphQLISODateTime)
  created: Date;
}

@ObjectType()
export class MyQuoteResponse {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  bookId: number;

  @Field(() => Int, { nullable: true })
  page: number | null;

  @Field()
  text: string;

  @Field({ nullable: true })
  comment: string | null;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field()
  bookTitle: string;

  @Field()
  bookAuthor: string;

  @Field()
  bookImage: string;
}
