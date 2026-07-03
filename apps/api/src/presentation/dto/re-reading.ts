import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class GetBookReReadingsInput {
  @Field(() => Int)
  bookId: number;
}

@InputType()
export class CreateReReadingInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => GraphQLISODateTime)
  finished: Date;

  @Field({ nullable: true })
  memo?: string | null;
}

@InputType()
export class DeleteReReadingInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class ReReadingResponse {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  bookId: number;

  @Field(() => GraphQLISODateTime)
  finished: Date;

  @Field({ nullable: true })
  memo: string | null;

  @Field(() => GraphQLISODateTime)
  created: Date;
}
