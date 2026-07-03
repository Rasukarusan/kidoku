import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class FollowAuthorInput {
  @Field()
  authorName: string;
}

@InputType()
export class UnfollowAuthorInput {
  @Field(() => Int)
  id: number;
}

@InputType()
export class GetAuthorNewReleasesInput {
  @Field()
  authorName: string;
}

@ObjectType()
export class AuthorFollowResponse {
  @Field(() => ID)
  id: string;

  @Field()
  authorName: string;

  @Field(() => GraphQLISODateTime)
  created: Date;
}

@ObjectType()
export class AuthorNewReleaseResponse {
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

  @Field({ nullable: true })
  salesDate?: string;
}
