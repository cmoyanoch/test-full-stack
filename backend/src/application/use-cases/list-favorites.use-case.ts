import { Inject, Injectable } from '@nestjs/common';
import { Favorite } from '../../domain/favorite.entity';
import { FAVORITE_REPOSITORY, IFavoriteRepository } from '../ports/favorite-repository.port';

@Injectable()
export class ListFavoritesUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favorites: IFavoriteRepository,
  ) {}

  execute(clientId: string): Promise<Favorite[]> {
    return this.favorites.findAll(clientId);
  }
}
