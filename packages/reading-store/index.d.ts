import { Prisma, PrismaClient } from "@prisma/client";

type Database = Pick<
  PrismaClient,
  "$queryRaw" | "collection" | "collectionHighlight" | "itemTemplate"
>;
export type ReadingBook = {
  id: number;
  userId: string;
  sheetId: number;
  title: string;
  author: string;
  category: string;
  image: string;
  impression: string;
  memo: string;
  isPublicMemo: boolean;
  isPurchasable: boolean;
  price: string | null;
  finished: Date | null;
  created: Date;
  updated: Date;
  user: { id: string; name: string | null; image: string | null };
  sheet: { id: number; name: string };
  _count: { likes: number };
};
export type BookFilter = {
  id?: number | number[];
  userId?: string;
  sheetId?: number;
  isPublicMemo?: boolean;
  finished?: { not?: null; gte?: Date; lte?: Date };
  categories?: string[];
  authors?: string[];
  followingUserId?: string;
  search?: {
    text: string;
    fields: ("title" | "author" | "category" | "memo")[];
  };
};
export type BookOrder = Partial<
  Record<"id" | "title" | "finished" | "created" | "updated", "asc" | "desc">
>;
export function readBooks(
  db: Database,
  options?: {
    filter?: BookFilter;
    orderBy?: BookOrder | BookOrder[];
    limit?: number;
    offset?: number;
  },
): Promise<ReadingBook[]>;
export function readBook(
  db: Database,
  filter: BookFilter,
): Promise<ReadingBook | null>;
export function countBooks(db: Database, filter?: BookFilter): Promise<number>;
export type ReadingSheet = {
  id: number;
  userId: string;
  name: string;
  description: string;
  order: number;
  created: Date;
  updated: Date;
  user: { name: string | null };
};
export function readSheets(
  db: Database,
  options?: {
    where?: Prisma.CollectionWhereInput;
    orderBy?:
      | Prisma.CollectionOrderByWithRelationInput
      | Prisma.CollectionOrderByWithRelationInput[];
    limit?: number;
  },
): Promise<ReadingSheet[]>;
export type ReadingHighlight = {
  year: string;
  order: number;
  book: Pick<
    ReadingBook,
    "id" | "title" | "author" | "image" | "memo" | "isPublicMemo"
  >;
};
export function readHighlights(
  db: Database,
  options?: {
    userId?: string;
    year?: string;
    username?: string;
    orderBy?: Prisma.CollectionHighlightOrderByWithRelationInput;
  },
): Promise<ReadingHighlight[]>;
export function readTemplates(
  db: Database,
  userId: string,
): Promise<
  {
    id: number;
    userId: string;
    name: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
    isPublicMemo: boolean;
    created: Date;
    updated: Date;
  }[]
>;
export function readLibrary(
  db: Database,
  userId: string,
): Promise<(ReadingSheet & { books: ReadingBook[] })[]>;
