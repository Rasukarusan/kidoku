import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SheetsResponseDto {
  @Field()
  message: string;
}
