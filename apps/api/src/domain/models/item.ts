export type AttributeValue = string | string[] | number | boolean;
export type Attributes = Record<string, AttributeValue>;

export interface AttributeField {
  key: string;
  label: string;
  type: 'text' | 'textList' | 'number' | 'boolean';
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ItemTypeDefinition {
  fields: AttributeField[];
  logKinds: { key: string; label: string; dateLabel: string }[];
  itemUnit: string;
  searchProvider?: string;
  analysis?: string[];
}

export interface ItemTypeData {
  key: string;
  name: string;
  schemaVersion: number;
  definition: ItemTypeDefinition;
}

export interface ItemLogData {
  id: number;
  itemId: number;
  kind: string;
  occurredAt: Date | null;
  memo: string;
  rating: string | null;
}

export interface ItemData {
  id: number;
  userId: string;
  itemTypeId: string;
  title: string;
  imageUrl: string;
  category: string;
  rating: string;
  memo: string;
  isPublicMemo: boolean;
  isPurchasable: boolean;
  price: string | null;
  attributes: Attributes;
  attributesVersion: number;
  createdAt: Date;
  updatedAt: Date;
  collectionIds: number[];
  logs: ItemLogData[];
}

export interface CollectionData {
  id: number;
  userId: string;
  name: string;
  description: string;
  position: number;
  itemCount: number;
  highlights: { itemId: number; position: number }[];
}

export interface SaveItemInput {
  itemTypeId: string;
  title: string;
  imageUrl: string;
  category: string;
  rating: string;
  memo: string;
  isPublicMemo: boolean;
  isPurchasable?: boolean;
  price?: string | null;
  attributes: Attributes;
  collectionIds: number[];
}

export interface SaveLogInput {
  kind: string;
  occurredAt: Date | null;
  memo: string;
  rating: string | null;
}

export function validateTitle(title: string): string {
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100) {
    throw new Error('タイトルは1〜100文字で入力してください');
  }
  return title.trim();
}

export function validateRating(rating: string | null): void {
  if (rating !== null && !['-', '◎', '◯', '△', '✗'].includes(rating)) {
    throw new Error('評価の値が不正です');
  }
}

export function validateAttributes(
  definition: ItemTypeDefinition,
  attributes: Attributes,
): Attributes {
  if (
    !attributes ||
    typeof attributes !== 'object' ||
    Array.isArray(attributes)
  ) {
    throw new Error('属性はオブジェクトで指定してください');
  }
  const knownKeys = new Set(definition.fields.map((field) => field.key));
  if (Object.keys(attributes).some((key) => !knownKeys.has(key))) {
    throw new Error('この種類では利用できない属性です');
  }
  const result: Attributes = {};
  for (const field of definition.fields) {
    const value = attributes[field.key];
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && !value.length)
    ) {
      if (field.required) throw new Error(`${field.label}は必須です`);
      continue;
    }
    const textIsValid = (text: unknown) =>
      typeof text === 'string' &&
      text.trim().length > 0 &&
      text.length <= (field.maxLength ?? 120);
    const valid =
      (field.type === 'text' && textIsValid(value)) ||
      (field.type === 'textList' &&
        Array.isArray(value) &&
        value.length <= 30 &&
        value.every(textIsValid)) ||
      (field.type === 'number' &&
        typeof value === 'number' &&
        Number.isSafeInteger(value) &&
        value >= (field.min ?? 0) &&
        value <= (field.max ?? 1000000)) ||
      (field.type === 'boolean' && typeof value === 'boolean');
    if (!valid) throw new Error(`${field.label}の値が不正です`);
    result[field.key] = value;
  }
  return result;
}

export function validateLog(
  definition: ItemTypeDefinition,
  input: SaveLogInput,
): void {
  if (!definition.logKinds.some((kind) => kind.key === input.kind)) {
    throw new Error('この種類では利用できない履歴です');
  }
  if (input.occurredAt && !Number.isFinite(input.occurredAt.getTime())) {
    throw new Error('日付が不正です');
  }
  if (typeof input.memo !== 'string' || input.memo.length > 100000) {
    throw new Error('履歴メモは100000文字以下で入力してください');
  }
  validateRating(input.rating);
}
