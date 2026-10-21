import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ICollectionRepository } from '../../domain/repositories/collection';
import { CollectionRepository } from '../../infrastructure/repositories/collection';
import { ManageCollectionsUseCase } from '../../application/usecases/collections/manage-collections';
import { CollectionResolver } from '../resolvers/collection';
import { IUserRepository } from '../../domain/repositories/user';
import { ISearchRepository } from '../../domain/repositories/search';
import { UserRepository } from '../../infrastructure/repositories/user';
import { SearchRepository } from '../../infrastructure/repositories/search';
import { MeiliSearchProvider } from '../../infrastructure/search/meilisearch.providers';

@Module({
  imports: [AuthModule],
  providers: [
    CollectionResolver,
    ManageCollectionsUseCase,
    { provide: ICollectionRepository, useClass: CollectionRepository },
    MeiliSearchProvider,
    { provide: ISearchRepository, useClass: SearchRepository },
    { provide: IUserRepository, useClass: UserRepository },
  ],
})
export class CollectionModule {}
