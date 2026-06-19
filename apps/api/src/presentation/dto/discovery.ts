import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PopularBookItem {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  image: string;

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
export class TopReaderItem {
  @Field()
  name: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Int)
  bookCount: number;
}
