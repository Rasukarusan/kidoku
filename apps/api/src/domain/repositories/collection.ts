import {
  CollectionData,
  ItemData,
  ItemLogData,
  ItemTypeData,
  SaveItemInput,
  SaveLogInput,
} from '../models/item';

export interface ItemFilter {
  collectionId?: number;
  itemTypeId?: string;
  from?: Date;
  to?: Date;
  query?: string;
}

export abstract class ICollectionRepository {
  abstract types(): Promise<ItemTypeData[]>;
  abstract collections(userId: string): Promise<CollectionData[]>;
  abstract saveCollection(
    userId: string,
    input: { id?: number; name: string; description: string },
  ): Promise<CollectionData>;
  abstract deleteCollection(userId: string, id: number): Promise<void>;
  abstract setHighlight(
    userId: string,
    collectionId: number,
    position: number,
    itemId: number | null,
  ): Promise<void>;
  abstract items(userId: string, filter: ItemFilter): Promise<ItemData[]>;
  abstract item(userId: string, id: number): Promise<ItemData | null>;
  abstract saveItem(
    userId: string,
    id: number | undefined,
    input: SaveItemInput,
    version: number,
    initialLog?: SaveLogInput,
  ): Promise<ItemData>;
  abstract deleteItem(userId: string, id: number): Promise<void>;
  abstract saveLog(
    userId: string,
    itemId: number,
    id: number | undefined,
    input: SaveLogInput,
  ): Promise<ItemLogData>;
  abstract deleteLog(userId: string, itemId: number, id: number): Promise<void>;
}
