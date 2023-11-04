import { MeiliSearch } from 'meilisearch'
export default new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
})
