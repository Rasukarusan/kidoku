import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let html = ''
  const decoder = new TextDecoder()
  const body = await fetch(
    'https://www.amazon.co.jp/s?k=software+design+2022%E5%B9%B47%E6%9C%88%E5%8F%B7'
  ).then((res) => res.body)

  const reader = body.getReader()
  function readChunk({ done, value }) {
    if (done) {
      const $ = cheerio.load(html)
      $('.s-image').map((i, v) => {
        console.log($(v).attr('alt'))
        console.log($(v).attr('src'))
      })
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
