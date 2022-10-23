import type { NextApiRequest, NextApiResponse } from 'next'
import resemble from 'node-resemble-js'
import * as cheerio from 'cheerio'
import { downloadImage } from '@/libs/downloadImage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const targetImage =
    'http://books.google.com/books/content?id=AIazzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'
  ;(async () => {
    return downloadImage(targetImage, `target.jpg`)
  })()
  let html = ''
  const decoder = new TextDecoder()
  const body = await fetch(
    'https://www.amazon.co.jp/s?k=%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%83%BB%E3%83%98%E3%82%A4%E3%83%AB%E3%83%BB%E3%83%A1%E3%82%A2%E3%83%AA%E3%83%BC+%E4%B8%8A'
  ).then((res) => res.body)
  const reader = body.getReader()
  function readChunk({ done, value }) {
    if (done) {
      // amazon検索結果から画像URLを抽出
      // 後にPromise.Allで画像一括DLするためPromise配列を返す
      const $ = cheerio.load(html)
      const reqs = $('.s-image').map((i, v) => {
        const imageURL = $(v).attr('src')
        const title = $(v).attr('alt')
        return downloadImage(imageURL, `${title}.jpg`)
      })

      // 画像を一括DLし、1つずつ類似度を取得
      ;(async () => {
        const results = await Promise.all(reqs)
        results.forEach((image) => {
          console.log(image)
          resemble('./target.jpg')
            .compareTo(image)
            .onComplete((data) => {
              console.log(data)
            })
        })
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
