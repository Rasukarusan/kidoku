import {
  Field,
  ObjectType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@ObjectType()
export class SheetObject {
  /** 主キー ─ 数値なら Int でも OK。一般的には ID 推奨 */
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  /** 外部キーも ID で揃えるとクライアント側で解釈しやすい */
  @Field(() => ID)
  userId: string;

  /** Drizzle の列が TIMESTAMP 型なら Date スカラを使う */
  @Field(() => GraphQLISODateTime, { nullable: true })
  created?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updated?: Date;

  /** null を返す可能性があるフィールドは nullable:true を明示 */
  @Field(() => Int, { nullable: true })
  order?: number;
}
