import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getHttpCorsOptions } from '../src/config/cors-config';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableCors(getHttpCorsOptions());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /favorites responde 200 con un array', () => {
    return request(app.getHttpServer())
      .get('/favorites')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('GET /health responde 200 con status ok cuando la BD responde', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: 'ok',
          db: 'up',
        });
        expect(typeof res.body.uptimeSeconds).toBe('number');
        expect(typeof res.body.timestamp).toBe('string');
      });
  });

  it('GET /metrics expone métricas en formato Prometheus', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect((res) => {
        expect(res.text).toContain('http_requests_total');
        expect(res.text).toContain('http_request_duration_seconds');
        expect(res.text).toContain('socket_events_emitted_total');
      });
  });
});
