import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';

@Controller()
export class MetricsController {
  @Get('/metrics')
  async getMetrics(@Res() response: Response) {
    response.set('Content-Type', register.contentType);
    response.end(await register.metrics());
  }
}
