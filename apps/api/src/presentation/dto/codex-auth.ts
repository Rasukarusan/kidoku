import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CodexAuthStatusResponse {
  @Field()
  connected: boolean;

  @Field(() => String, { nullable: true })
  accountId: string | null;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  /** access_tokenが期限切れかどうか（生成時に自動リフレッシュされる） */
  @Field()
  expired: boolean;
}

@ObjectType()
export class CodexDeviceAuthResponse {
  @Field()
  deviceAuthId: string;

  @Field()
  userCode: string;

  @Field()
  verificationUrl: string;

  @Field(() => Int)
  intervalSeconds: number;
}

@InputType()
export class PollCodexDeviceAuthInput {
  @Field()
  deviceAuthId: string;

  @Field()
  userCode: string;
}

@ObjectType()
export class PollCodexDeviceAuthResponse {
  /** pending: 認可待ち / authorized: ログイン完了 */
  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  accountId: string | null;
}
