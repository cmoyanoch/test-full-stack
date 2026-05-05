import { Inject, Injectable } from '@nestjs/common';
import { FavoriteNotFoundError } from '../../domain/domain.errors';
import { Favorite } from '../../domain/favorite.entity';
import { FAVORITE_REPOSITORY, IFavoriteRepository } from '../ports/favorite-repository.port';
import {
  IRealtimeNotifierPort,
  REALTIME_NOTIFIER,
} from '../ports/realtime-notifier.port';

@Injectable()
export class UpdateFavoriteNoteUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favorites: IFavoriteRepository,
    @Inject(REALTIME_NOTIFIER)
    private readonly notifier: IRealtimeNotifierPort,
  ) {}

  async execute(
    clientId: string,
    id: string,
    note: string | null | undefined,
  ): Promise<Favorite> {
    const fav = await this.favorites.findById(clientId, id);
    if (!fav) {
      throw new FavoriteNotFoundError(id);
    }
    if (note === undefined) {
      return fav;
    }
    fav.note = note;
    const saved = await this.favorites.save(fav);
    this.notifier.notifyFavoriteUpdated({
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
