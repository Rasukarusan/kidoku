export const createXShareUrl = (text: string, url: string) => {
  const params = new URLSearchParams({
    text,
    url,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export const shareToSns = async (text: string, url: string) => {
  if (typeof window === 'undefined') return

  if (navigator.share) {
    try {
      await navigator.share({
        text,
        url,
      })
      return
    } catch {
      // キャンセル時はフォールバックでX投稿画面を開く
    }
  }

  window.open(createXShareUrl(text, url), '_blank', 'noopener,noreferrer')
}
