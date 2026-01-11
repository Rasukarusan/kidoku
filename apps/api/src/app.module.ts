import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { SoftwareDesignModule } from './presentation/modules/software-design';
import { SheetModule } from './presentation/modules/sheet';
import { CommentModule } from './presentation/modules/comment';
import { BookModule } from './presentation/modules/book';
import { SearchModule } from './presentation/modules/search';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }: { req: any }) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: req.user, // HeaderStrategy → req.user
      }),
      playground: true,
    }),
    SheetModule,
    CommentModule,
    SoftwareDesignModule,
    BookModule,
    SearchModule,
  ],
})
export class AppModule {}
