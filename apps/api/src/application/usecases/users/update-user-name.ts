import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/models/user';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class UpdateUserNameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, name: string): Promise<User> {
    return await this.userRepository.updateName(userId, name);
  }
}
