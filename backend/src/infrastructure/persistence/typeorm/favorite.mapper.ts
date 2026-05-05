import { Favorite } from '../../../domain/favorite.entity';
import { FavoriteOrmEntity } from './favorite.orm-entity';

export function favoriteToDomain(row: FavoriteOrmEntity): Favorite {
  return new Favorite(
    row.id,
    row.clientId,
    row.pokemonId,
    row.pokemonName,
    row.imageUrl,
    row.note,
    row.createdAt,
  );
}

export function favoriteToOrm(f: Favorite): FavoriteOrmEntity {
  const row = new FavoriteOrmEntity();
  row.id = f.id;
  row.clientId = f.clientId;
  row.pokemonId = f.pokemonId;
  row.pokemonName = f.pokemonName;
  row.imageUrl = f.imageUrl;
  row.note = f.note;
  row.createdAt = f.createdAt;
  return row;
}
