import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DuplicateFavoriteError } from '../../domain/domain.errors';
import { Favorite } from '../../domain/favorite.entity';
import { FAVORITE_REPOSITORY, IFavoriteRepository } from '../ports/favorite-repository.port';
import {
  IRealtimeNotifierPort,
  REALTIME_NOTIFIER,
} from '../ports/realtime-notifier.port';

export interface AddFavoriteInput {
  clientId: string;
  pokemonId: number;
  pokemonName: string;
  imageUrl: string;
  note?: string | null;
}

@Injectable()
export class AddFavoriteUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favorites: IFavoriteRepository,
    @Inject(REALTIME_NOTIFIER)
    private readonly notifier: IRealtimeNotifierPort,
  ) {}

  async execute(input: AddFavoriteInput): Promise<Favorite> {
    const existing = await this.favorites.findByPokemonId(
      input.clientId,
      input.pokemonId,
    );
    if (existing) {
      throw new DuplicateFavoriteError(input.pokemonId);
    }
    const favorite = new Favorite(
      randomUUID(),
      input.clientId,
      input.pokemonId,
      input.pokemonName,
      input.imageUrl,
      input.note ?? null,
      new Date(),
    );
    const saved = await this.favorites.save(favorite);
    this.notifier.notifyFavoriteAdded({
      clientId: saved.clientId,
      favoriteId: saved.id,
      pokemonId: saved.pokemonId,
      pokemonName: saved.pokemonName,
      imageUrl: saved.imageUrl,
      note: saved.note,
      createdAt: saved.createdAt.toISOString(),
    });
    return saved;
  }
}
