import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SheetOrderItem {
  @Field()
  id: string;

  @Field()
  order: number;
}

@InputType()
export class UpdateSheetOrdersInput {
  @Field(() => [SheetOrderItem])
  sheets: SheetOrderItem[];
}
