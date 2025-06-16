import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateSheetInput {
  @Field()
  oldName: string;

  @Field()
  newName: string;
}
