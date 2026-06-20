import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class UpdateUserNameInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateSuiAddressInput {
  // 空文字は受取アドレスのリセットとして許可するため必須にはしない
  @Field()
  @MaxLength(70)
  suiAddress: string;
}

@InputType()
export class GetUserImageInput {
  @Field()
  name: string;
}

@InputType()
export class CheckNameAvailableInput {
  @Field()
  name: string;
}

@ObjectType()
export class UserResponse {
  @Field()
  name: string;

  @Field({ nullable: true })
  suiAddress?: string;
}
