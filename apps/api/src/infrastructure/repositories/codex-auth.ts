import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ICodexAuthRepository } from '../../domain/repositories/codex-auth';
import { CodexAuth } from '../../domain/models/codex-auth';
import { TokenCipher } from '../ai/codex/token-cipher';

/** 暗号化して保存するトークン本体 */
type EncryptedTokens = {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
};

@Injectable()
export class CodexAuthRepository implements ICodexAuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cipher: TokenCipher,
  ) {}

  async findByUserId(userId: string): Promise<CodexAuth | null> {
    const row = await this.prisma.codexAuth.findUnique({ where: { userId } });
    if (!row) return null;

    const tokens = JSON.parse(
      this.cipher.decrypt(row.tokenEnc),
    ) as EncryptedTokens;
    return CodexAuth.fromDatabase({
      userId: row.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      accountId: row.accountId,
      expiresAt: row.expiresAt,
    });
  }

  async save(auth: CodexAuth): Promise<void> {
    const tokens: EncryptedTokens = {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      idToken: auth.idToken,
    };
    const data = {
      accountId: auth.accountId,
      tokenEnc: this.cipher.encrypt(JSON.stringify(tokens)),
      expiresAt: auth.expiresAt,
    };
    await this.prisma.codexAuth.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId, ...data },
      update: data,
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.codexAuth.deleteMany({ where: { userId } });
  }
}
