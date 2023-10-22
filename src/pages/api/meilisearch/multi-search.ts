import axios from 'axios'

/**
 * フロントでmeilisearch-reactを使うとホストとマスターキーが丸見えになってしまうので
 * Next.jsサーバー側でMeiliSearchにリクエストを送る
 */
export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(400).json({ result: false })
  }
  try {
    const response = await axios({
      method: req.method,
      url: process.env.MEILI_HOST + '/multi-search',
      data: req.body,
      headers: {
        ...req.headers,
        Authorization: 'Bearer ' + process.env.MEILI_MASTER_KEY,
      },
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(500).json({ result: false })
  }
}
