export const INJECTION_TOKENS = {
  DRIZZLE: 'DRIZZLE',
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
} as const;

// 後方互換性のため一時的に残す
export const DATABASE_CONNECTION = INJECTION_TOKENS.DATABASE_CONNECTION;
