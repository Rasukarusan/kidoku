import { Field, ObjectType, InputType, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateRatingAxisInput {
  @Field()
  name: string;
}

@InputType()
export class DeleteRatingAxisInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class GetBookRatingsInput {
  @Field(() => Int)
  bookId: number;
}

@InputType()
export class SetBookRatingInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int)
  axisId: number;

  @Field(() => Int, { nullable: true })
  value?: number | null;
}

@ObjectType()
export class RatingAxisResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class BookRatingResponse {
  @Field(() => Int)
  axisId: number;

  @Field()
  axisName: string;

  @Field(() => Int)
  value: number;
}
