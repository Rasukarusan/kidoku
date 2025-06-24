import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SoftwareDesignObject {
  @Field()
  yearMonth: string;

  @Field()
  title: string;

  @Field()
  coverImageUrl: string;

  @Field()
  publishDate: string;

  @Field({ nullable: true })
  isbn?: string;

  @Field()
  author: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  memo?: string;
}

@ObjectType()
export class SoftwareDesignListResponseDto {
  @Field(() => [SoftwareDesignObject])
  items: SoftwareDesignObject[];

  @Field()
  total: number;
}
