import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetUserImageUseCase } from '../../application/usecases/users/get-user-image';
import { CheckNameAvailableUseCase } from '../../application/usecases/users/check-name-available';
import { UpdateUserNameUseCase } from '../../application/usecases/users/update-user-name';
import { DeleteUserUseCase } from '../../application/usecases/users/delete-user';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  UserResponse,
  UpdateUserNameInput,
  GetUserImageInput,
  CheckNameAvailableInput,
} from '../dto/user';

@Resolver()
export class UserResolver {
  constructor(
    private readonly getUserImageUseCase: GetUserImageUseCase,
    private readonly checkNameAvailableUseCase: CheckNameAvailableUseCase,
    private readonly updateUserNameUseCase: UpdateUserNameUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Query(() => String)
  async userImage(@Args('input') input: GetUserImageInput): Promise<string> {
    return await this.getUserImageUseCase.execute(input.name);
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async isNameAvailable(
    @Args('input') input: CheckNameAvailableInput,
  ): Promise<boolean> {
    return await this.checkNameAvailableUseCase.execute(input.name);
  }

  @Mutation(() => UserResponse)
  @UseGuards(GqlAuthGuard)
  async updateUserName(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateUserNameInput,
  ): Promise<UserResponse> {
    const updated = await this.updateUserNameUseCase.execute(
      user.id,
      input.name,
    );
    return { name: updated.name ?? '' };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteUser(@CurrentUser() user: { id: string }): Promise<boolean> {
    await this.deleteUserUseCase.execute(user.id);
    return true;
  }
}
