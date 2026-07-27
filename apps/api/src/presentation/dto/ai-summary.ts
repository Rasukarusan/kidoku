import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown) {
    return value;
  },
  parseValue(value: unknown) {
    return value;
  },
});

/**
 * AI読書分析生成(REST: POST /ai-summary/generate)のリクエストボディ
 */
export class GenerateAiSummaryDto {
  sheetName: string;
  months: number[];
  categories: string[];
}

@ObjectType()
export class AiSummaryResponse {
  @Field(() => Int)
  id: number;

  @Field(() => GraphQLJSON)
  analysis: Record<string, unknown>;
}

@InputType()
export class SaveAiSummaryInput {
  @Field()
  sheetName: string;

  @Field(() => GraphQLJSON)
  analysis: Record<string, unknown>;
}

@InputType()
export class DeleteAiSummaryInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class DeleteAiSummaryResponse {
  @Field(() => Int)
  deletedCount: number;
}
