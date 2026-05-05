import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

/**
 * Registro Prometheus + métricas que necesitan dos consumidores: el middleware HTTP y el gateway Socket.IO.
 * Se usa un Registry propio (en vez del default global) para no chocar si los tests crean varias instancias.
 */
@Injectable()
export class MetricsService {
  readonly registry: Registry;
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDurationSeconds: Histogram<string>;
  readonly socketEventsEmittedTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests handled by the API',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.socketEventsEmittedTotal = new Counter({
      name: 'socket_events_emitted_total',
      help: 'Total Socket.IO events emitted by the realtime gateway',
      labelNames: ['event'],
      registers: [this.registry],
    });
  }

  recordHttp(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ): void {
    const labels = { method, route, status_code: String(statusCode) };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationMs / 1000);
  }

  recordSocketEvent(event: string): void {
    this.socketEventsEmittedTotal.inc({ event });
  }

  async expose(): Promise<string> {
    return this.registry.metrics();
  }

  get contentType(): string {
    return this.registry.contentType;
  }
}
