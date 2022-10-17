import { selector } from 'recoil'
import { selectItemsAtom } from './atom'
import { SelectItems } from '@/features/index/types'

export const selectItemsCopyTextSelector = selector({
  key: 'selectItemsCopyTextSelector',
  get: ({ get }) => {
    const selectItems = get(selectItemsAtom)
    return getCopyText(selectItems)
  },
})

/**
 * クリップボードにコピーするテキストを取得
 */
const getCopyText = (selectItems: SelectItems): string => {
  let text = ''
  const textList = selectItems.map((item) => {
    const title = item.volumeInfo.title ?? '-'
    const authors = item.volumeInfo.authors?.join(',') ?? '-'
    const categories = item.volumeInfo.categories ?? '-'
    const imageLink = item.volumeInfo.imageLinks
      ? item.volumeInfo.imageLinks.thumbnail
      : '/no-image.png'
    text += title + '\t' + authors + '\t' + categories + '\t' + imageLink + '\n'
  })
  return text
}
