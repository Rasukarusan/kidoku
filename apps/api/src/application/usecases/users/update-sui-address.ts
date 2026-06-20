import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/models/user';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class UpdateSuiAddressUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Sui の受取アドレスを更新する。
   * 空文字を渡すと未設定（null）にリセットされる。
   */
  async execute(userId: string, suiAddress: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    // ドメインモデルでバリデーション（形式チェック・空文字のリセット）
    user.updateSuiAddress(suiAddress);
    return this.userRepository.updateSuiAddress(userId, user.suiAddress);
  }
}
