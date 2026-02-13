import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';

@InputType()
export class SearchBooksInput {
  @Field()
  query: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;
}

@ObjectType()
export class SearchHitResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  image: string;

  @Field()
  memo: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  userImage?: string;

  @Field()
  sheet: string;
}

@ObjectType()
export class SearchBooksResponse {
  @Field(() => [SearchHitResponse])
  hits: SearchHitResponse[];

  @Field(() => Int)
  totalHits: number;

  @Field(() => Int)
  hitsPerPage: number;

  @Field(() => Int)
  page: number;

  @Field()
  hasMore: boolean;
}

@InputType()
export class SearchGoogleBooksInput {
  @Field()
  query: string;
}

@ObjectType()
export class GoogleBookHitResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  category: string;

  @Field()
  image: string;
}

@ObjectType()
export class IndexBooksResponse {
  @Field(() => Int)
  count: number;
}
