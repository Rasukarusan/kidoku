/* eslint-disable no-constant-condition */
import type { NextApiRequest, NextApiResponse } from 'next'
import { downloadAmazonImages, downloadImage } from '@/libs/downloadImage'
import resemble from 'node-resemble-js'

export const compareImage = async (image) => {
  const r = await resemble('./target.jpg')
    .compareTo(image)
    .onComplete((data) => data)
  console.log(r)
  return r
}

export const getHtml = async (url: string) => {
  let html = ''
  const body = await fetch(url).then((res) => res.body)
  const decoder = new TextDecoder()
  const reader = body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    html += decoder.decode(value)
  }
  return html
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 対象の画像をDLしておく
  await downloadImage(
    'https://app.rasukarusan.com/_next/image?url=http%3A%2F%2Fbooks.google.com%2Fbooks%2Fcontent%3Fid%3DHIGsDwAAQBAJ%26printsec%3Dfrontcover%26img%3D1%26zoom%3D1%26edge%3Dcurl%26source%3Dgbs_api&w=256&q=75',
    `target.jpg`
  )
  const html = await getHtml(
    'https://www.amazon.co.jp/s?k=%E3%83%9E%E3%83%B3%E3%82%AC%E3%81%A7%E3%82%8F%E3%81%8B%E3%82%8B+%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%A7%E6%AD%A3%E3%81%97%E3%81%84%E3%81%8A%E9%87%91%E3%81%AE%E5%A2%97%E3%82%84%E3%81%97%E6%96%B9'
  )
  // 大体上位5件以内に見つかるので、処理速度向上のため絞る
  const { links, images } = await downloadAmazonImages(html, 5)

  // 画像差分が一番小さいものを抽出
  const diffs = []
  images.forEach((image, index) => {
    resemble('./target.jpg')
      .compareTo(image)
      .onComplete((data) => {
        diffs.push(parseInt(data.misMatchPercentage))
      })
  })
  const i = diffs.indexOf(Math.min(...diffs))

  return res.status(200).json({ link: links[i], image: images[i] })
}
