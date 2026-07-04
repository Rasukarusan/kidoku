import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class CreateMemoTemplateInput {
  @Field()
  name: string;

  @Field()
  content: string;

  @Field()
  isDefault: boolean;
}

@InputType()
export class UpdateMemoTemplateInput {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  content: string;

  @Field()
  isDefault: boolean;
}

@InputType()
export class DeleteMemoTemplateInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class MemoTemplateResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  content: string;

  @Field()
  isDefault: boolean;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field(() => GraphQLISODateTime)
  updated: Date;
}
