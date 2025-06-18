import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommentObject {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  memo: string;

  @Field()
  image: string;

  @Field()
  updated: Date;

  @Field()
  username: string;

  @Field({ nullable: true })
  userImage?: string;

  @Field()
  sheet: string;
}