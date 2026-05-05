import { DuplicateFavoriteError } from '../../domain/domain.errors';
import { Favorite } from '../../domain/favorite.entity';
import { AddFavoriteUseCase } from './add-favorite.use-case';

describe('AddFavoriteUseCase', () => {
  const clientId = 'client-a';

  it('throws DuplicateFavoriteError when pokemonId already favorited for same client', async () => {
    const existing = new Favorite(
      '550e8400-e29b-41d4-a716-446655440000',
      clientId,
      25,
      'pikachu',
      'https://example.com/p.png',
      null,
      new Date(),
    );
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPokemonId: jest.fn().mockResolvedValue(existing),
      save: jest.fn(),
      delete: jest.fn(),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new AddFavoriteUseCase(repo as never, notifier as never);
    await expect(
      uc.execute({
        clientId,
        pokemonId: 25,
        pokemonName: 'pikachu',
        imageUrl: 'https://example.com/p.png',
      }),
    ).rejects.toBeInstanceOf(DuplicateFavoriteError);
    expect(repo.findByPokemonId).toHaveBeenCalledWith(clientId, 25);
    expect(repo.save).not.toHaveBeenCalled();
    expect(notifier.notifyFavoriteAdded).not.toHaveBeenCalled();
  });

  it('persists and notifies when new favorite', async () => {
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPokemonId: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((f: Favorite) => Promise.resolve(f)),
      delete: jest.fn(),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new AddFavoriteUseCase(repo as never, notifier as never);
    const result = await uc.execute({
      clientId,
      pokemonId: 7,
      pokemonName: 'squirtle',
      imageUrl: 'https://example.com/7.png',
      note: 'hi',
    });
    expect(result.pokemonId).toBe(7);
    expect(result.clientId).toBe(clientId);
    expect(repo.save).toHaveBeenCalled();
    expect(notifier.notifyFavoriteAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId,
        pokemonId: 7,
        pokemonName: 'squirtle',
        imageUrl: 'https://example.com/7.png',
        note: 'hi',
      }),
    );
  });
});
