import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FavoritesModule } from './favorites/favorites.module';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { HttpAccessMiddleware } from './presentation/logging/http-access.middleware';
import { OpenApiDocsModule } from './presentation/open-api-docs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpenApiDocsModule,
    DatabaseModule,
    FavoritesModule,
    PokemonModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpAccessMiddleware).forRoutes('*');
  }
}
