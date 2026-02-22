import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class CreateTemplateBookInput {
  @Field()
  name: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  category: string;

  @Field()
  image: string;

  @Field()
  memo: string;

  @Field()
  isPublicMemo: boolean;
}

@InputType()
export class DeleteTemplateBookInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class TemplateBookResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  category: string;

  @Field()
  image: string;

  @Field()
  memo: string;

  @Field()
  isPublicMemo: boolean;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field(() => GraphQLISODateTime)
  updated: Date;
}
