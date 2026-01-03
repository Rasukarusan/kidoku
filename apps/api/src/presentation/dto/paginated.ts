import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class PaginatedResponse {
  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
