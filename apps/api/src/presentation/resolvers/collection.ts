import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ManageCollectionsUseCase } from '../../application/usecases/collections/manage-collections';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  CollectionResponse,
  ItemFilterInput,
  ItemLogInput,
  ItemLogResponse,
  ItemResponse,
  ItemTypeResponse,
  SaveCollectionInput,
  SaveItemInput,
} from '../dto/collection';

@Resolver()
@UseGuards(GqlAuthGuard)
export class CollectionResolver {
  constructor(private readonly useCase: ManageCollectionsUseCase) {}

  @Query(() => [ItemTypeResponse])
  itemTypes() {
    return this.useCase.types();
  }

  @Query(() => [CollectionResponse])
  collections(@CurrentUser() user: { id: string }) {
    return this.useCase.collections(user.id);
  }

  @Query(() => [ItemResponse])
  items(
    @CurrentUser() user: { id: string },
    @Args('input', { nullable: true }) input?: ItemFilterInput,
  ) {
    return this.useCase.items(user.id, input ?? {});
  }

  @Query(() => ItemResponse)
  item(
    @CurrentUser() user: { id: string },
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.useCase.item(user.id, id);
  }

  @Mutation(() => CollectionResponse)
  saveCollection(
    @CurrentUser() user: { id: string },
    @Args('input') input: SaveCollectionInput,
  ) {
    return this.useCase.saveCollection(user.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCollection(
    @CurrentUser() user: { id: string },
    @Args('id', { type: () => Int }) id: number,
  ) {
    await this.useCase.deleteCollection(user.id, id);
    return true;
  }

  @Mutation(() => ItemResponse)
  saveItem(
    @CurrentUser() user: { id: string },
    @Args('input') input: SaveItemInput,
  ) {
    const { id, initialLog, ...values } = input;
    return this.useCase.saveItem(user.id, id, values, initialLog);
  }

  @Mutation(() => Boolean)
  async setCollectionHighlight(
    @CurrentUser() user: { id: string },
    @Args('collectionId', { type: () => Int }) collectionId: number,
    @Args('position', { type: () => Int }) position: number,
    @Args('itemId', { type: () => Int, nullable: true }) itemId?: number,
  ) {
    await this.useCase.setHighlight(
      user.id,
      collectionId,
      position,
      itemId ?? null,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async deleteItem(
    @CurrentUser() user: { id: string },
    @Args('id', { type: () => Int }) id: number,
  ) {
    await this.useCase.deleteItem(user.id, id);
    return true;
  }

  @Mutation(() => ItemLogResponse)
  saveItemLog(
    @CurrentUser() user: { id: string },
    @Args('itemId', { type: () => Int }) itemId: number,
    @Args('input') input: ItemLogInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.useCase.saveLog(user.id, itemId, id, input);
  }

  @Mutation(() => Boolean)
  async deleteItemLog(
    @CurrentUser() user: { id: string },
    @Args('itemId', { type: () => Int }) itemId: number,
    @Args('id', { type: () => Int }) id: number,
  ) {
    await this.useCase.deleteLog(user.id, itemId, id);
    return true;
  }
}
