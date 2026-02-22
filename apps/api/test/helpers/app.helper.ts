import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TEST_SECRET } from './auth.helper';

// Modules
import { DatabaseModule } from '../../src/infrastructure/database/database.module';
import { BookModule } from '../../src/presentation/modules/book';
import { SheetModule } from '../../src/presentation/modules/sheet';
import { CommentModule } from '../../src/presentation/modules/comment';
import { UserModule } from '../../src/presentation/modules/user';

// Repository interfaces
import { IBookRepository } from '../../src/domain/repositories/book';
import { ISheetRepository } from '../../src/domain/repositories/sheet';
import { ICommentRepository } from '../../src/domain/repositories/comment';
import { IUserRepository } from '../../src/domain/repositories/user';
import { ISearchRepository } from '../../src/domain/repositories/search';

// Infrastructure
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { INJECTION_TOKENS } from '../../src/shared/constants/injection-tokens';

const noopFn = () => Promise.resolve();

export interface MockRepositories {
  bookRepository: Partial<IBookRepository>;
  sheetRepository: Partial<ISheetRepository>;
  commentRepository: Partial<ICommentRepository>;
  userRepository: Partial<IUserRepository>;
  searchRepository: Partial<ISearchRepository>;
}

/**
 * E2Eテスト用のNestJSアプリケーションをセットアップする
 * リポジトリはモックに差し替え、DBやMeiliSearchへの接続を不要にする
 */
export async function createTestApp(
  mocks: Partial<MockRepositories> = {},
): Promise<{ app: INestApplication; module: TestingModule }> {
  const moduleBuilder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            NEXTAUTH_SECRET: TEST_SECRET,
          }),
        ],
      }),
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: join(__dirname, 'test-schema.gql'),

        context: ({ req }: { req: { user?: unknown } }) => ({
          req,

          user: req.user,
        }),
      }),
      DatabaseModule,
      BookModule,
      SheetModule,
      CommentModule,
      UserModule,
    ],
  });

  // PrismaServiceをモック（DB接続を防ぐ）
  moduleBuilder.overrideProvider(PrismaService).useValue({
    $connect: noopFn,
    $disconnect: noopFn,
    onModuleInit: noopFn,
    onModuleDestroy: noopFn,
  });

  // MeiliSearchクライアントをモック
  moduleBuilder
    .overrideProvider(INJECTION_TOKENS.MEILISEARCH)
    .useValue({ index: () => ({}) });

  // リポジトリをモックに差し替え
  if (mocks.bookRepository) {
    moduleBuilder
      .overrideProvider(IBookRepository)
      .useValue(mocks.bookRepository);
  }
  if (mocks.sheetRepository) {
    moduleBuilder
      .overrideProvider(ISheetRepository)
      .useValue(mocks.sheetRepository);
  }
  if (mocks.commentRepository) {
    moduleBuilder
      .overrideProvider(ICommentRepository)
      .useValue(mocks.commentRepository);
  }
  if (mocks.userRepository) {
    moduleBuilder
      .overrideProvider(IUserRepository)
      .useValue(mocks.userRepository);
  }
  if (mocks.searchRepository) {
    moduleBuilder
      .overrideProvider(ISearchRepository)
      .useValue(mocks.searchRepository);
  }

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication();
  await app.init();

  return { app, module };
}
