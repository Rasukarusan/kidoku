import axios from 'axios'
import fs from 'fs'
import * as cheerio from 'cheerio'

export async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  })
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath))
  })
}

/**
 * Amazon検索結果から画像を一括DLし、ファイル名配列を返す
 */
export const downloadAmazonImages = async (html: string, limit: number) => {
  const $ = cheerio.load(html)
  const links = []
  const requests = []
  $('.s-image')
    .slice(0, limit)
    .map((i, v) => {
      const imageURL = $(v).attr('src')
      const title = $(v).attr('alt')
      const link = 'https://www.amazon.co.jp' + $(v).parents('a').attr('href')
      links.push(link)
      requests.push(downloadImage(imageURL, `${title}.jpg`))
    })
  return { links, images: await Promise.all(requests) }
}
