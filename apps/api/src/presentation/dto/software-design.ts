import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class GetSoftwareDesignInput {
  @Field(() => Int)
  @IsInt()
  @Min(2000)
  @Max(3000)
  year: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

@ObjectType()
export class SoftwareDesignResponse {
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
export class SoftwareDesignListResponse {
  @Field(() => [SoftwareDesignResponse])
  items: SoftwareDesignResponse[];

  @Field()
  total: number;
}
