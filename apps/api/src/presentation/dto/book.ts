import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { MaxLength, IsNotEmpty, IsOptional } from 'class-validator';

const MAX_TITLE_LENGTH = 100;

@InputType()
export class CreateBookInput {
  @Field(() => Int)
  sheetId: number;

  @Field()
  @IsNotEmpty({ message: '書籍タイトルは必須です' })
  @MaxLength(MAX_TITLE_LENGTH, {
    message: `タイトルは${MAX_TITLE_LENGTH}文字以下で入力してください`,
  })
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
  memo: string;

  @Field()
  isPublicMemo: boolean;

  @Field({ nullable: true })
  isPurchasable?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  finished?: Date;
}

@InputType()
export class UpdateBookInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(MAX_TITLE_LENGTH, {
    message: `タイトルは${MAX_TITLE_LENGTH}文字以下で入力してください`,
  })
  title?: string;

  @Field({ nullable: true })
  author?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  impression?: string;

  @Field({ nullable: true })
  memo?: string;

  @Field({ nullable: true })
  isPublicMemo?: boolean;

  @Field({ nullable: true })
  isPurchasable?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  finished?: Date;

  @Field(() => Int, { nullable: true })
  sheetId?: number;
}

@InputType()
export class DeleteBookInput {
  @Field(() => ID)
  id: string;
}

@InputType()
export class GetBooksInput {
  @Field(() => Int, { nullable: true })
  sheetId?: number;
}

@InputType()
export class GetBookInput {
  @Field(() => ID)
  id: string;
}

@ObjectType()
export class BookResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Int)
  sheetId: number;

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

  @Field({ nullable: true })
  memo?: string;

  @Field()
  isPublicMemo: boolean;

  @Field()
  isPurchasable: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  finished?: Date;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field(() => GraphQLISODateTime)
  updated: Date;
}

@ObjectType()
export class CreateBookResponse {
  @Field()
  result: boolean;

  @Field()
  bookTitle: string;

  @Field()
  sheetName: string;

  @Field(() => ID)
  bookId: string;
}
