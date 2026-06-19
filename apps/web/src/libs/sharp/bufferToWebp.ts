import sharp from 'sharp'

export const bufferToWebp = async (
  imageBuffer: Buffer | ArrayBuffer
): Promise<ArrayBuffer> => {
  const webp = await sharp(imageBuffer)
    .resize(158)
    .webp({ quality: 90 })
    .toBuffer()
  // Node の Buffer をそのまま渡すと @vercel/blob の put() の body 型と不整合になるため
  // ArrayBuffer に変換して返す
  return webp.buffer.slice(
    webp.byteOffset,
    webp.byteOffset + webp.byteLength
  ) as ArrayBuffer
}
