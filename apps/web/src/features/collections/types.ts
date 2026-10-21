export interface ItemType {
  key: string
  name: string
  schemaVersion: number
  definition: {
    fields: {
      key: string
      label: string
      type: 'text' | 'textList' | 'number' | 'boolean'
      required?: boolean
      maxLength?: number
      min?: number
      max?: number
    }[]
    logKinds: { key: string; label: string; dateLabel: string }[]
    itemUnit: string
    searchProvider?: string
    analysis?: string[]
  }
}

export interface Collection {
  highlights?: { itemId: number; position: number }[]
  id: number
  userId: string
  name: string
  description: string
  itemCount: number
}

export interface ItemLog {
  id: number
  itemId: number
  kind: string
  occurredAt: string | null
  memo: string
  rating: string | null
}

export interface Item {
  likeCount?: number
  id: number
  userId: string
  itemTypeId: string
  title: string
  imageUrl: string
  category: string
  rating: string
  memo: string
  isPublicMemo: boolean
  isPurchasable: boolean
  price: string | null
  attributes: Record<string, string | string[] | number | boolean>
  attributesVersion: number
  collectionIds: number[]
  logs: ItemLog[]
  createdAt: string
  updatedAt: string
}
