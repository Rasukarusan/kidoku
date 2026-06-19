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
export class FollowUserInput {
  @Field(() => ID)
  userId: string;
}

@InputType()
export class GetFollowInfoInput {
  @Field()
  name: string;
}

@InputType()
export class GetFeedInput {
  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class FollowInfoResponse {
  @Field(() => Int)
  followers: number;

  @Field(() => Int)
  following: number;

  @Field()
  isFollowing: boolean;
}

@ObjectType()
export class FeedBookItem {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;

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

  @Field(() => Int)
  likeCount: number;
}

@ObjectType()
export class FeedResponse extends PaginatedResponse {
  @Field(() => [FeedBookItem])
  books: FeedBookItem[];
}
