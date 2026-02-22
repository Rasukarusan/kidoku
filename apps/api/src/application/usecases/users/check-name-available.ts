import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class CheckNameAvailableUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string): Promise<boolean> {
    const user = await this.userRepository.findByName(name);
    return user === null;
  }
}
