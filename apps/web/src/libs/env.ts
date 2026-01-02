/**
 * 本番環境のみSSGを有効にする
 * VERCEL_ENV === 'production' の場合のみSSGを使用
 * それ以外（プレビュー環境、ローカル開発）ではSSRを使用
 */
export const isSSGEnabled = process.env.VERCEL_ENV === 'production'
