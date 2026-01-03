import { Field, ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { PaginatedResponse } from './paginated.response';

@ObjectType()
export class CommentItem {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  memo: string;

  @Field()
  image: string;

  @Field(() => GraphQLISODateTime)
  updated: Date;

  @Field()
  username: string;

  @Field({ nullable: true })
  userImage?: string;

  @Field()
  sheet: string;
}

@ObjectType()
export class CommentResponse extends PaginatedResponse {
  @Field(() => [CommentItem])
  comments: CommentItem[];
}
