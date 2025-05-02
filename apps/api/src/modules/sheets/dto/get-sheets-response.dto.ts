import { ObjectType, Field } from '@nestjs/graphql';
import { Sheet } from '../models/sheet.model';
import { SheetObject } from './sheet.object';

@ObjectType()
export class GetSheetsResponseDto {
  @Field(() => [SheetObject])
  sheets: Sheet[];
}
