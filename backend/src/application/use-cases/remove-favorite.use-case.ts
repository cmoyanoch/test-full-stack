import { Inject, Injectable } from '@nestjs/common';
import { FavoriteNotFoundError } from '../../domain/domain.errors';
import { FAVORITE_REPOSITORY, IFavoriteRepository } from '../ports/favorite-repository.port';
import {
  IRealtimeNotifierPort,
  REALTIME_NOTIFIER,
} from '../ports/realtime-notifier.port';

@Injectable()
export class RemoveFavoriteUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favorites: IFavoriteRepository,
    @Inject(REALTIME_NOTIFIER)
    private readonly notifier: IRealtimeNotifierPort,
  ) {}

  async execute(clientId: string, id: string): Promise<void> {
    const fav = await this.favorites.findById(clientId, id);
    if (!fav) {
      throw new FavoriteNotFoundError(id);
    }
    const pokemonId = fav.pokemonId;
    await this.favorites.delete(clientId, id);
    this.notifier.notifyFavoriteRemoved({
      clientId,
      favoriteId: id,
      pokemonId,
    });
  }
}
