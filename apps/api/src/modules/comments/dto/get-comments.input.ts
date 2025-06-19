import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetCommentsInput {
  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  offset: number;
}
