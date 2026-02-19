import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { SearchRepository } from '../infrastructure/repositories/search';
import { BookRepository } from '../infrastructure/repositories/book';
import { MeiliSearchProvider } from '../infrastructure/search/meilisearch.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import {
  ISearchRepository,
  BookSearchDocument,
} from '../domain/repositories/search';
import { IBookRepository } from '../domain/repositories/book';

@Module({
  imports: [DatabaseModule],
  providers: [
    MeiliSearchProvider,
    {
      provide: ISearchRepository,
      useClass: SearchRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
class ReindexModule {}

async function bootstrap() {
  console.log('Starting MeiliSearch reindex...');

  const app = await NestFactory.createApplicationContext(ReindexModule);

  try {
    const bookRepository = app.get(IBookRepository);
    const searchRepository = app.get(ISearchRepository);

    const booksForSearch = await bookRepository.findAllForSearch();

    const documents: BookSearchDocument[] = booksForSearch.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      memo: book.isPublicMemo ? book.memo : '',
      username: book.userName,
      userImage: book.userImage,
      sheet: book.sheetName,
    }));

    await searchRepository.addDocuments(documents);

    console.log(`Reindex completed! ${documents.length} books indexed.`);
  } catch (error) {
    console.error('Reindex failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
