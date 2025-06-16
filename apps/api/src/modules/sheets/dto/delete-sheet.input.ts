import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteSheetInput {
  @Field()
  name: string;
}
