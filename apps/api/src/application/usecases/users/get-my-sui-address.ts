import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class GetMySuiAddressUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<string | null> {
    const user = await this.userRepository.findById(userId);
    return user?.suiAddress ?? null;
  }
}
