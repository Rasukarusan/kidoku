import type { NextApiRequest, NextApiResponse } from 'next'
import { downloadAmazonImages, downloadImage } from '@/libs/downloadImage'
import resemble from 'node-resemble-js'

export const compareImage = (image) => {
  resemble('./target.jpg')
    .compareTo(image)
    .onComplete((data) => {
      console.log(image, data)
    })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 対象の画像をDLしておく
  await downloadImage(
    'http://books.google.com/books/content?id=AIazzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    `target.jpg`
  )
  let html = ''
  const decoder = new TextDecoder()
  const body = await fetch(
    'https://www.amazon.co.jp/s?k=%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%83%BB%E3%83%98%E3%82%A4%E3%83%AB%E3%83%BB%E3%83%A1%E3%82%A2%E3%83%AA%E3%83%BC+%E4%B8%8A'
  ).then((res) => res.body)
  const reader = body.getReader()
  function readChunk({ done, value }) {
    if (done) {
      // 画像を一括DLし、1つずつ類似度を取得
      ;(async () => {
        const images = await downloadAmazonImages(html)
        images.forEach((image) => compareImage(image))
      })()
      return
    }
    html += decoder.decode(value)
    // 次の値を読みにいく
    reader.read().then(readChunk)
  }
  // 最初の値を読み込む
  reader.read().then(readChunk)

  return res.status(200).json({ body })
}
