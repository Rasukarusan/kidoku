import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class HeaderStrategy extends PassportStrategy(Strategy, 'header') {
  async validate(req: Request): Promise<any> {
    // Next.jsのプロキシから送信されるカスタムヘッダーを確認
    const userId = req.headers['x-user-id'] as string;
    const isAdmin = req.headers['x-user-admin'] === 'true';

    if (!userId) {
      return false;
    }

    // ユーザー情報を返す（CurrentUserデコレーターで使用される）
    return {
      id: userId,
      admin: isAdmin,
    };
  }
}