import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetYearlyTopBooksInput {
  @Field()
  year: string;
}

@InputType()
export class UpsertYearlyTopBookInput {
  @Field()
  year: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  bookId: number;
}

@InputType()
export class DeleteYearlyTopBookInput {
  @Field()
  year: string;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class YearlyTopBookBookInfo {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  image: string;
}

@ObjectType()
export class YearlyTopBookResponse {
  @Field()
  year: string;

  @Field(() => Int)
  order: number;

  @Field(() => YearlyTopBookBookInfo)
  book: YearlyTopBookBookInfo;
}
