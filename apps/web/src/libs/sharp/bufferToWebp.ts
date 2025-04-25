import sharp from 'sharp'

export const bufferToWebp = async (imageBuffer: Buffer | ArrayBuffer) => {
  return await sharp(imageBuffer).resize(158).webp({ quality: 90 }).toBuffer()
}
