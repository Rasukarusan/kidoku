import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateSheetInput {
  @Field()
  name: string;
}
