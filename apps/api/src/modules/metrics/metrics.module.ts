import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import {
  httpRequestsTotal,
  httpRequestDuration,
  graphqlRequestsTotal,
  graphqlRequestDuration,
  databaseQueryDuration,
  aiRequestsTotal,
} from './metrics.providers';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    httpRequestsTotal,
    httpRequestDuration,
    graphqlRequestsTotal,
    graphqlRequestDuration,
    databaseQueryDuration,
    aiRequestsTotal,
  ],
  exports: [
    httpRequestsTotal,
    httpRequestDuration,
    graphqlRequestsTotal,
    graphqlRequestDuration,
    databaseQueryDuration,
    aiRequestsTotal,
  ],
})
export class MetricsModule {}
