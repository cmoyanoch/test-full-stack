import { Favorite } from '../../domain/favorite.entity';

export interface IFavoriteRepository {
  findAll(clientId: string): Promise<Favorite[]>;
  findById(clientId: string, id: string): Promise<Favorite | null>;
  findByPokemonId(
    clientId: string,
    pokemonId: number,
  ): Promise<Favorite | null>;
  save(favorite: Favorite): Promise<Favorite>;
  delete(clientId: string, id: string): Promise<void>;
}

export const FAVORITE_REPOSITORY = Symbol('IFavoriteRepository');
