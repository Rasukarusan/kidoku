import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SoftwareDesignModule } from './presentation/modules/software-design';
import { SheetModule } from './presentation/modules/sheet';
import { CommentModule } from './presentation/modules/comment';
import { BookCommentModule } from './presentation/modules/book-comment';
import { BookModule } from './presentation/modules/book';
import { SearchModule } from './presentation/modules/search';
import { YearlyTopBookModule } from './presentation/modules/yearly-top-book';
import { UserModule } from './presentation/modules/user';
import { AiSummaryModule } from './presentation/modules/ai-summary';
import { TemplateBookModule } from './presentation/modules/template-book';
import { MemoTemplateModule } from './presentation/modules/memo-template';
import { QuoteModule } from './presentation/modules/quote';
import { TagModule } from './presentation/modules/tag';
import { ReReadingModule } from './presentation/modules/re-reading';
import { RatingAxisModule } from './presentation/modules/rating-axis';
import { FollowModule } from './presentation/modules/follow';
import { LikeModule } from './presentation/modules/like';
import { NotificationModule } from './presentation/modules/notification';
import { DiscoveryModule } from './presentation/modules/discovery';
import { PurchaseModule } from './presentation/modules/purchase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile:
        process.env.NODE_ENV === 'production'
          ? true
          : join(process.cwd(), 'src/schema.gql'),
      context: ({ req }: { req: any }) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: req.user, // HeaderStrategy → req.user
      }),
    }),
    DatabaseModule,
    SheetModule,
    CommentModule,
    BookCommentModule,
    SoftwareDesignModule,
    BookModule,
    SearchModule,
    YearlyTopBookModule,
    UserModule,
    AiSummaryModule,
    TemplateBookModule,
    MemoTemplateModule,
    QuoteModule,
    TagModule,
    ReReadingModule,
    RatingAxisModule,
    FollowModule,
    LikeModule,
    NotificationModule,
    DiscoveryModule,
    PurchaseModule,
  ],
})
export class AppModule {}
