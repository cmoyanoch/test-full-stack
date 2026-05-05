import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from '../../infrastructure/observability/metrics.service';
import { appLog } from './structured-log';

type RequestWithMatchedRoute = Request & {
  route?: { path?: string };
};

@Injectable()
export class HttpAccessMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const path = req.originalUrl ?? req.url;

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const statusCode = res.statusCode;
      const level =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';

      const matchedRoute = (req as RequestWithMatchedRoute).route?.path;
      const route = typeof matchedRoute === 'string' ? matchedRoute : 'unmatched';

      this.metrics.recordHttp(
        req.method ?? 'UNKNOWN',
        route,
        statusCode,
        durationMs,
      );

      appLog(level, 'Http', 'request completed', {
        method: req.method,
        path,
        route,
        statusCode,
        durationMs,
      });
    });

    next();
  }
}
