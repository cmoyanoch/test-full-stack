import { FavoriteNotFoundError } from '../../domain/domain.errors';
import { Favorite } from '../../domain/favorite.entity';
import { RemoveFavoriteUseCase } from './remove-favorite.use-case';

describe('RemoveFavoriteUseCase', () => {
  const clientId = 'client-r';

  it('throws FavoriteNotFoundError when id does not exist', async () => {
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByPokemonId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new RemoveFavoriteUseCase(repo as never, notifier as never);
    await expect(
      uc.execute(clientId, '00000000-0000-4000-8000-000000000099'),
    ).rejects.toBeInstanceOf(FavoriteNotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
    expect(notifier.notifyFavoriteRemoved).not.toHaveBeenCalled();
  });

  it('deletes and notifies when favorite exists', async () => {
    const fav = new Favorite(
      'f0e4952b-0c49-49d8-afc9-87cf4a145488',
      clientId,
      4,
      'pikachu',
      'https://example.com/p.png',
      null,
      new Date(),
    );
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(fav),
      findByPokemonId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new RemoveFavoriteUseCase(repo as never, notifier as never);
    await uc.execute(clientId, fav.id);
    expect(repo.delete).toHaveBeenCalledWith(clientId, fav.id);
    expect(notifier.notifyFavoriteRemoved).toHaveBeenCalledWith({
      clientId,
      favoriteId: fav.id,
      pokemonId: 4,
    });
  });
});
