import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { PaginatedResponse } from './paginated';

@InputType()
export class GetBookCommentsInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  offset: number;
}

@InputType()
export class CreateBookCommentInput {
  @Field(() => Int)
  bookId: number;

  @Field()
  content: string;
}

@InputType()
export class DeleteBookCommentInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class BookCommentItem {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  bookId: number;

  @Field()
  userId: string;

  @Field()
  content: string;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field(() => GraphQLISODateTime)
  updated: Date;

  @Field()
  username: string;

  @Field({ nullable: true })
  userImage?: string;
}

@ObjectType()
export class BookCommentsResponse extends PaginatedResponse {
  @Field(() => [BookCommentItem])
  comments: BookCommentItem[];
}
