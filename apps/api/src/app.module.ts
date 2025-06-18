import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HelloModule } from './modules/hello/hello.module';
import { SheetsModule } from './modules/sheets/sheets.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({
        req,
        user: req.user, // JwtStrategy → req.user
      }),
      playground: true,
    }),
    HelloModule,
    SheetsModule,
    CommentsModule,
    HealthModule,
  ],
})
export class AppModule {}
