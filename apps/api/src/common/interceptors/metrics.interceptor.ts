import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Counter, Histogram } from 'prom-client'
import { InjectMetric } from '@willsoto/nestjs-prometheus'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now()
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000
        const route = request.route?.path || request.url
        const method = request.method
        const statusCode = response.statusCode

        this.httpRequestsTotal.inc({
          method,
          route,
          status_code: statusCode.toString(),
        })

        this.httpRequestDuration.observe(
          {
            method,
            route,
            status_code: statusCode.toString(),
          },
          duration,
        )
      }),
    )
  }
}