import { Field, ObjectType, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserNameInput {
  @Field()
  name: string;
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
}
