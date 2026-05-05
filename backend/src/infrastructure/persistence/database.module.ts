import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAVORITE_REPOSITORY } from '../../application/ports/favorite-repository.port';
import { FavoriteOrmEntity } from './typeorm/favorite.orm-entity';
import { TypeOrmFavoriteRepository } from './typeorm/typeorm-favorite.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'pokemon'),
        synchronize: config.get<string>('TYPEORM_SYNC') === 'true',
        autoLoadEntities: true,
        entities: [FavoriteOrmEntity],
      }),
    }),
    TypeOrmModule.forFeature([FavoriteOrmEntity]),
  ],
  providers: [
    TypeOrmFavoriteRepository,
    {
      provide: FAVORITE_REPOSITORY,
      useClass: TypeOrmFavoriteRepository,
    },
  ],
  exports: [FAVORITE_REPOSITORY],
})
export class DatabaseModule {}
