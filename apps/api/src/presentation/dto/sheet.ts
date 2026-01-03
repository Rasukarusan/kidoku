import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class CreateSheetInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateSheetInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@InputType()
export class DeleteSheetInput {
  @Field(() => ID)
  id: string;
}

@InputType()
export class SheetOrderItem {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number;
}

@InputType()
export class UpdateSheetOrdersInput {
  @Field(() => [SheetOrderItem])
  sheets: SheetOrderItem[];
}

@ObjectType()
export class SheetResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  userId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  created?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updated?: Date;

  @Field(() => Int, { nullable: true })
  order?: number;
}
