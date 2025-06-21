import { InputType, Field, Int } from '@nestjs/graphql';
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