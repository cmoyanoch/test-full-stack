import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FavoritesModule } from './favorites/favorites.module';
import { MetricsModule } from './infrastructure/observability/metrics.module';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { HealthModule } from './presentation/health.module';
import { HttpAccessMiddleware } from './presentation/logging/http-access.middleware';
import { OpenApiDocsModule } from './presentation/open-api-docs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: parseInt(config.get<string>('THROTTLE_TTL') ?? '60000', 10),
          limit: parseInt(config.get<string>('THROTTLE_LIMIT') ?? '60', 10),
        },
      ],
    }),
    OpenApiDocsModule,
    MetricsModule,
    DatabaseModule,
    HealthModule,
    FavoritesModule,
    PokemonModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpAccessMiddleware).forRoutes('*');
  }
}
