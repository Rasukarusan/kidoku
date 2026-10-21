import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
  Logger,
} from '@nestjs/common';
import {
  ICollectionRepository,
  ItemFilter,
} from '../../../domain/repositories/collection';
import {
  SaveItemInput,
  ItemData,
  SaveLogInput,
  validateAttributes,
  validateLog,
  validateRating,
  validateTitle,
} from '../../../domain/models/item';
import { ISearchRepository } from '../../../domain/repositories/search';
import { IUserRepository } from '../../../domain/repositories/user';

@Injectable()
export class ManageCollectionsUseCase {
  private readonly logger = new Logger(ManageCollectionsUseCase.name);
  constructor(
    private readonly repository: ICollectionRepository,
    @Optional() private readonly search?: ISearchRepository,
    @Optional() private readonly users?: IUserRepository,
  ) {}

  private async removeSearchProjection(item: ItemData) {
    if (item.itemTypeId === 'book' && this.search)
      await this.search.deleteDocument(String(item.id));
  }

  private async projectSearch(item: ItemData) {
    if (
      !this.search ||
      !this.users ||
      item.itemTypeId !== 'book' ||
      !item.collectionIds.length
    )
      return;
    try {
      const user = await this.users.findById(item.userId);
      const collectionId = Math.min(...item.collectionIds);
      const collection = (await this.collections(item.userId)).find(
        (collection) => collection.id === collectionId,
      );
      if (!user?.name || !collection) return;
      await this.search.updateDocument({
        id: String(item.id),
        title: item.title,
        author: Array.isArray(item.attributes.authors)
          ? item.attributes.authors.join('、')
          : '',
        category: item.category,
        image: item.imageUrl,
        memo: item.isPublicMemo
          ? item.memo
              .replace(/\[\[MASK:\s*[\s\S]*?\]\]/g, '*****')
              .replace(/\\\[\\\[MASK:\s*[\s\S]*?\\\]\\\]/g, '*****')
              .replace(/\*[^*]*\*/g, '***')
          : '',
        username: user.name,
        userImage: user.image,
        sheet: collection.name,
      });
    } catch {
      // The old projection was removed before the write. A failed reindex must
      // neither expose stale memos nor make a committed save appear to fail.
      this.logger.warn('Item saved; search projection requires reindexing');
    }
  }

  types() {
    return this.repository.types();
  }
  collections(userId: string) {
    return this.repository.collections(userId);
  }
  items(userId: string, filter: ItemFilter) {
    if (filter.from && filter.to && filter.from > filter.to)
      throw new BadRequestException('期間の指定が不正です');
    return this.repository.items(userId, filter);
  }
  async item(userId: string, id: number) {
    const item = await this.repository.item(userId, id);
    if (!item) throw new NotFoundException('アイテムが見つかりません');
    return item;
  }
  saveCollection(
    userId: string,
    input: { id?: number; name: string; description: string },
  ) {
    if (
      !input.name?.trim() ||
      input.name.trim().length > 120 ||
      input.description.length > 10000
    ) {
      throw new BadRequestException(
        'コレクション名は1〜120文字、説明は10000文字以下で入力してください',
      );
    }
    return this.repository.saveCollection(userId, {
      ...input,
      name: input.name.trim(),
    });
  }
  async deleteCollection(userId: string, id: number) {
    const members = this.search
      ? await this.repository.items(userId, { collectionId: id })
      : [];
    for (const item of members) await this.removeSearchProjection(item);
    await this.repository.deleteCollection(userId, id);
    for (const item of members) {
      const saved = await this.repository.item(userId, item.id);
      if (saved) await this.projectSearch(saved);
    }
  }

  setHighlight(
    userId: string,
    collectionId: number,
    position: number,
    itemId: number | null,
  ) {
    if (!Number.isInteger(position) || position < 1 || position > 3)
      throw new BadRequestException('お気に入りの順位は1〜3で指定してください');
    return this.repository.setHighlight(userId, collectionId, position, itemId);
  }

  async saveItem(
    userId: string,
    id: number | undefined,
    input: SaveItemInput,
    initialLog?: SaveLogInput,
  ) {
    const type = (await this.types()).find(
      (type) => type.key === input.itemTypeId,
    );
    if (!type) throw new BadRequestException('種類が見つかりません');
    let existing: ItemData | undefined;
    if (id) {
      existing = await this.item(userId, id);
      if (existing.itemTypeId !== input.itemTypeId)
        throw new BadRequestException('登録済みアイテムの種類は変更できません');
      if (existing.attributesVersion !== type.schemaVersion)
        throw new BadRequestException('属性のバージョン更新が必要です');
    }
    if (input.isPurchasable && input.itemTypeId !== 'book')
      throw new BadRequestException(
        'この種類のメモ販売にはまだ対応していません',
      );
    if (input.price !== undefined && input.price !== null) {
      if (
        typeof input.price !== 'string' ||
        input.price.length > 40 ||
        !/^\d+$/.test(input.price) ||
        BigInt(input.price) <= 0n
      )
        throw new BadRequestException(
          '価格は0より大きいMIST単位の整数で指定してください',
        );
      input = { ...input, price: BigInt(input.price).toString() };
    }
    if (input.isPurchasable === null)
      input = { ...input, isPurchasable: undefined };
    const title = validateTitle(input.title);
    validateRating(input.rating);
    const attributes = validateAttributes(type.definition, input.attributes);
    if (
      input.category.length > 120 ||
      input.imageUrl.length > 255 ||
      input.memo.length > 100000
    ) {
      throw new BadRequestException(
        'カテゴリ・画像URL・メモの入力上限を超えています',
      );
    }
    if (
      input.imageUrl &&
      input.imageUrl !== '/no-image.png' &&
      !/^https?:\/\//i.test(input.imageUrl)
    ) {
      throw new BadRequestException(
        '画像にはHTTPまたはHTTPSのURLを指定してください',
      );
    }
    if (
      !input.collectionIds.every((id) => Number.isSafeInteger(id) && id > 0) ||
      input.collectionIds.length > 100
    ) {
      throw new BadRequestException('コレクションの指定が不正です');
    }
    if (initialLog) {
      if (id)
        throw new BadRequestException('初回履歴は新規登録時のみ指定できます');
      validateLog(type.definition, initialLog);
    }
    if (existing) await this.removeSearchProjection(existing);
    const saved = await this.repository.saveItem(
      userId,
      id,
      {
        ...input,
        title,
        attributes,
        collectionIds: [...new Set(input.collectionIds)],
      },
      type.schemaVersion,
      initialLog,
    );
    await this.projectSearch(saved);
    return saved;
  }
  async deleteItem(userId: string, id: number) {
    if (this.search)
      await this.removeSearchProjection(await this.item(userId, id));
    await this.repository.deleteItem(userId, id);
  }
  async saveLog(
    userId: string,
    itemId: number,
    id: number | undefined,
    input: SaveLogInput,
  ) {
    const item = await this.item(userId, itemId);
    const type = (await this.types()).find(
      (type) => type.key === item.itemTypeId,
    );
    if (!type) throw new BadRequestException('種類が見つかりません');
    validateLog(type.definition, input);
    return this.repository.saveLog(userId, itemId, id, input);
  }
  deleteLog(userId: string, itemId: number, id: number) {
    return this.repository.deleteLog(userId, itemId, id);
  }
}
