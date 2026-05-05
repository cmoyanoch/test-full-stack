import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { appLog } from './logging/structured-log';

interface HealthResponse {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  db: 'up' | 'down';
  timestamp: string;
}

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthResponse> {
    let dbOk = false;
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbOk = true;
      }
    } catch (error) {
      appLog('warn', 'Http', 'health probe failed db check', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    }

    return {
      status: dbOk ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      db: dbOk ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
