import {
  Field,
  InputType,
  Int,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';
import { Attributes } from '../../domain/models/item';

export const CollectionJSON = new GraphQLScalarType({
  name: 'CollectionJSON',
  description: 'Structured item type definitions and validated item attributes',
  serialize: (value: unknown) => value,
  parseValue: (value: unknown) => value,
  parseLiteral: (node, variables) => valueFromASTUntyped(node, variables),
});

@InputType()
export class ItemFilterInput {
  @Field(() => Int, { nullable: true }) collectionId?: number;
  @Field({ nullable: true }) itemTypeId?: string;
  @Field(() => GraphQLISODateTime, { nullable: true }) from?: Date;
  @Field(() => GraphQLISODateTime, { nullable: true }) to?: Date;
  @Field({ nullable: true }) query?: string;
}

@InputType()
export class ItemLogInput {
  @Field() kind: string;
  @Field(() => GraphQLISODateTime, { nullable: true }) occurredAt: Date | null =
    null;
  @Field({ defaultValue: '' }) memo: string = '';
  @Field(() => String, { nullable: true }) rating: string | null = null;
}

@InputType()
export class SaveItemInput {
  @Field(() => Int, { nullable: true }) id?: number;
  @Field() itemTypeId: string;
  @Field() title: string;
  @Field({ defaultValue: '/no-image.png' }) imageUrl: string = '/no-image.png';
  @Field({ defaultValue: '' }) category: string = '';
  @Field({ defaultValue: '-' }) rating: string = '-';
  @Field({ defaultValue: '' }) memo: string = '';
  @Field({ defaultValue: false }) isPublicMemo: boolean = false;
  @Field({ nullable: true }) isPurchasable?: boolean;
  @Field(() => String, { nullable: true }) price?: string | null;
  @Field(() => CollectionJSON) attributes: Attributes;
  @Field(() => [Int], { defaultValue: [] }) collectionIds: number[] = [];
  @Field(() => ItemLogInput, { nullable: true }) initialLog?: ItemLogInput;
}

@InputType()
export class SaveCollectionInput {
  @Field(() => Int, { nullable: true }) id?: number;
  @Field() name: string;
  @Field({ defaultValue: '' }) description: string = '';
}

@ObjectType()
export class ItemTypeResponse {
  @Field() key: string;
  @Field() name: string;
  @Field(() => Int) schemaVersion: number;
  @Field(() => CollectionJSON) definition: unknown;
}

@ObjectType()
export class CollectionHighlightResponse {
  @Field(() => Int) itemId: number;
  @Field(() => Int) position: number;
}

@ObjectType()
export class CollectionResponse {
  @Field(() => Int) id: number;
  @Field() userId: string;
  @Field() name: string;
  @Field() description: string;
  @Field(() => Int) position: number;
  @Field(() => Int) itemCount: number;
  @Field(() => [CollectionHighlightResponse])
  highlights: CollectionHighlightResponse[];
}

@ObjectType()
export class ItemLogResponse {
  @Field(() => Int) id: number;
  @Field(() => Int) itemId: number;
  @Field() kind: string;
  @Field(() => GraphQLISODateTime, { nullable: true }) occurredAt: Date | null;
  @Field() memo: string;
  @Field(() => String, { nullable: true }) rating: string | null;
}

@ObjectType()
export class ItemResponse {
  @Field(() => Int) id: number;
  @Field() userId: string;
  @Field() itemTypeId: string;
  @Field() title: string;
  @Field() imageUrl: string;
  @Field() category: string;
  @Field() rating: string;
  @Field() memo: string;
  @Field() isPublicMemo: boolean;
  @Field() isPurchasable: boolean;
  @Field(() => String, { nullable: true }) price: string | null;
  @Field(() => CollectionJSON) attributes: Attributes;
  @Field(() => Int) attributesVersion: number;
  @Field(() => [Int]) collectionIds: number[];
  @Field(() => [ItemLogResponse]) logs: ItemLogResponse[];
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}
