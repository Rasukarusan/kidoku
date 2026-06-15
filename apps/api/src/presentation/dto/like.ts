import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LikeBookInput {
  @Field(() => Int)
  bookId: number;
}
