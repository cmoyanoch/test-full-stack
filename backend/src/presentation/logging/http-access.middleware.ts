import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { appLog } from './structured-log';

@Injectable()
export class HttpAccessMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const path = req.originalUrl ?? req.url;

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const statusCode = res.statusCode;
      const level =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      appLog(level, 'Http', 'request completed', {
        method: req.method,
        path,
        statusCode,
        durationMs,
      });
    });

    next();
  }
}
