import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SoftwareDesignObject {
  @Field(() => ID)
  id: string;

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
  isbn: string;
}

@ObjectType()
export class SoftwareDesignListResponseDto {
  @Field(() => [SoftwareDesignObject])
  items: SoftwareDesignObject[];

  @Field()
  total: number;
}