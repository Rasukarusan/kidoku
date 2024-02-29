/**
 * チャンネル名取得
 */
export function getChannelName(userId: string) {
  return 'presence-' + userId
}

/**
 * 認証
 */
export function auth(userId: string, channelName: string) {
  return getChannelName(userId) === channelName
}
