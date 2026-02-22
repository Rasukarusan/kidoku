import * as crypto from 'crypto';

export const TEST_SECRET = 'test-secret-for-e2e';
export const TEST_USER_ID = 'test-user-123';
export const TEST_ADMIN_USER_ID = 'admin-user-456';

/**
 * E2Eテスト用のHMAC-SHA256認証ヘッダーを生成する
 */
export function createAuthHeaders(
  userId = TEST_USER_ID,
  isAdmin = false,
): Record<string, string> {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${isAdmin}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', TEST_SECRET)
    .update(payload)
    .digest('hex');

  return {
    'x-user-id': userId,
    'x-user-admin': isAdmin.toString(),
    'x-timestamp': timestamp,
    'x-signature': signature,
  };
}
