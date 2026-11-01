export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const IMAGE_SIZE_ERROR = '画像は3MBまで登録できます。'

// FileReader の data URL は元の画像より約4/3倍になるため、元のバイト数で判定する。
export const isImageTooLarge = (image: unknown): boolean => {
  if (typeof image !== 'string' || !image.startsWith('data:')) return false
  const base64 = image.slice(image.indexOf(',') + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return (base64.length * 3) / 4 - padding > MAX_IMAGE_BYTES
}
