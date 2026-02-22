import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
