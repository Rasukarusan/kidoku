import { Module } from '@nestjs/common';
import { UserResolver } from '../resolvers/user';
import { GetUserImageUseCase } from '../../application/usecases/users/get-user-image';
import { CheckNameAvailableUseCase } from '../../application/usecases/users/check-name-available';
import { UpdateUserNameUseCase } from '../../application/usecases/users/update-user-name';
import { DeleteUserUseCase } from '../../application/usecases/users/delete-user';
import { UserRepository } from '../../infrastructure/repositories/user';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IUserRepository } from '../../domain/repositories/user';

@Module({
  imports: [AuthModule],
  providers: [
    UserResolver,
    GetUserImageUseCase,
    CheckNameAvailableUseCase,
    UpdateUserNameUseCase,
    DeleteUserUseCase,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
  ],
})
export class UserModule {}
