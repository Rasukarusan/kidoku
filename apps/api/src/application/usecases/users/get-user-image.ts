import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class GetUserImageUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string): Promise<string> {
    const user = await this.userRepository.findByName(name);
    if (!user) return '';
    return user.image ?? '';
  }
}
