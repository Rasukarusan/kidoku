// 本の媒体（所有形態）の選択肢
export const MEDIA_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'paper', label: '紙の本' },
  { value: 'ebook', label: '電子書籍' },
  { value: 'audiobook', label: 'オーディオブック' },
  { value: 'library', label: '図書館' },
  { value: 'other', label: 'その他' },
]

export function mediaLabel(media?: string | null): string {
  if (!media) return ''
  return MEDIA_OPTIONS.find((option) => option.value === media)?.label ?? ''
}
