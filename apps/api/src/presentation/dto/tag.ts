import {
  Field,
  ObjectType,
  InputType,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class GetBookTagsInput {
  @Field(() => Int)
  bookId: number;
}

@InputType()
export class GetBooksByTagInput {
  @Field()
  tagName: string;
}

@InputType()
export class SetBookTagsInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => [String])
  tags: string[];
}

@ObjectType()
export class TagWithCountResponse {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  bookCount: number;
}

@ObjectType()
export class TaggedBookResponse {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  category: string;

  @Field()
  image: string;

  @Field()
  impression: string;

  @Field()
  sheetName: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  finished: Date | null;
}
