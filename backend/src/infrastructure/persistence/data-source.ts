import 'dotenv/config';
import 'reflect-metadata';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { FavoriteOrmEntity } from './typeorm/favorite.orm-entity';

/**
 * DataSource para TypeORM CLI (`migration:run`, etc.).
 * El runtime de Nest usa `DatabaseModule`; mantener opciones alineadas.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'pokemon',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [FavoriteOrmEntity],
  migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
});
