import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { MetricsService } from '../infrastructure/observability/metrics.service';

@SkipThrottle()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const body = await this.metrics.expose();
    res.set('Content-Type', this.metrics.contentType);
    res.status(200).send(body);
  }
}
