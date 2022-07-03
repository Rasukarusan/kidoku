export interface Results {
  [key: string]: Item[]
}

interface ImageLinks {
  smallThumbnail: string
  thumbnail: string
}

interface VolumeInfo {
  allowAnonLogging: boolean
  authors?: string[]
  canonicalVolumeLink: string
  categories: string[]
  contentVersion: string
  description?: string
  imageLinks?: ImageLinks
  industryIdentifiers: Record<string, string>
  infoLink: string
  language: string
  maturityRating: string
  previewLink: string
  printType: string
  publishedDate: string
  publisher: string
  readingModes: Record<string, string>
  subtitle: string
  title: string
}

export interface Item {
  // TODO: volumeInfo以外は使わないのでRecord<string, string>にしておく
  accessInfo: Record<string, string>
  etag: string
  id: string
  kind: string
  saleInfo: Record<string, string>
  searchInfo: Record<string, string>
  selfLink: string
  volumeInfo: VolumeInfo
}

export interface SelectList {
  [key: string]: { title: string; authors: string[]; categories: string[] }
}
