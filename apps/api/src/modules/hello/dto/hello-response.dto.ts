import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HelloResponseDto {
  @Field()
  message: string;
}
