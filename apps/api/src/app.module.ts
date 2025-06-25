import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HelloModule } from './modules/hello/hello.module';
import { SheetsModule } from './modules/sheets/sheets.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HealthModule } from './health/health.module';
import { SoftwareDesignModule } from './modules/software-design/software-design.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

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
        user: req.user, // JwtStrategy → req.user
      }),
      playground: true,
    }),
    HelloModule,
    SheetsModule,
    CommentsModule,
    HealthModule,
    SoftwareDesignModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
