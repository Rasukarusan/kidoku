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
export const downloadAmazonImages = async (html: string) => {
  const $ = cheerio.load(html)
  const requests = $('.s-image').map((i, v) => {
    const imageURL = $(v).attr('src')
    const title = $(v).attr('alt')
    return downloadImage(imageURL, `${title}.jpg`)
  })
  return Promise.all(requests)
}
