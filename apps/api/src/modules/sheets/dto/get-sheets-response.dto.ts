import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GetSheetsResponseDto {
  @Field()
  message: string;
}
