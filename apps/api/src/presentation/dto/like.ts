import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LikeBookInput {
  @Field(() => Int)
  bookId: number;

  /** 未ログインユーザーの識別子（Cookie由来）。ログイン時は不要 */
  @Field(() => String, { nullable: true })
  anonymousId?: string;
}
