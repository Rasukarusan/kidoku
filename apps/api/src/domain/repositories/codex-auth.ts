import { CodexAuth } from '../models/codex-auth';

/**
 * ユーザーが接続したChatGPTアカウントのトークンを保持するリポジトリ。
 * 1ユーザーにつき1件を保持する。
 */
export abstract class ICodexAuthRepository {
  abstract findByUserId(userId: string): Promise<CodexAuth | null>;
  abstract save(auth: CodexAuth): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
