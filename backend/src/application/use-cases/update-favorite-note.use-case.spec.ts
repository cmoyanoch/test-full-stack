import { FavoriteNotFoundError } from '../../domain/domain.errors';
import { Favorite } from '../../domain/favorite.entity';
import { UpdateFavoriteNoteUseCase } from './update-favorite-note.use-case';

describe('UpdateFavoriteNoteUseCase', () => {
  const id = 'f0e4952b-0c49-49d8-afc9-87cf4a145488';
  const clientId = 'client-u';
  const createdAt = new Date('2020-01-01T00:00:00.000Z');

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
    const uc = new UpdateFavoriteNoteUseCase(repo as never, notifier as never);
    await expect(uc.execute(clientId, id, 'x')).rejects.toBeInstanceOf(
      FavoriteNotFoundError,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('returns favorite unchanged when note is undefined', async () => {
    const fav = new Favorite(
      id,
      clientId,
      4,
      'pikachu',
      'https://example.com/p.png',
      'old',
      createdAt,
    );
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(fav),
      findByPokemonId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new UpdateFavoriteNoteUseCase(repo as never, notifier as never);
    const out = await uc.execute(clientId, id, undefined);
    expect(out.note).toBe('old');
    expect(repo.save).not.toHaveBeenCalled();
    expect(notifier.notifyFavoriteUpdated).not.toHaveBeenCalled();
  });

  it('saves note and notifies when note is provided', async () => {
    const fav = new Favorite(
      id,
      clientId,
      4,
      'pikachu',
      'https://example.com/p.png',
      null,
      createdAt,
    );
    const updated = new Favorite(
      id,
      clientId,
      4,
      'pikachu',
      'https://example.com/p.png',
      'new note',
      createdAt,
    );
    const repo = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(fav),
      findByPokemonId: jest.fn(),
      save: jest.fn().mockResolvedValue(updated),
      delete: jest.fn(),
    };
    const notifier = {
      notifyFavoriteAdded: jest.fn(),
      notifyFavoriteRemoved: jest.fn(),
      notifyFavoriteUpdated: jest.fn(),
    };
    const uc = new UpdateFavoriteNoteUseCase(repo as never, notifier as never);
    const out = await uc.execute(clientId, id, 'new note');
    expect(out.note).toBe('new note');
    expect(repo.save).toHaveBeenCalled();
    expect(notifier.notifyFavoriteUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId,
        favoriteId: id,
        pokemonId: 4,
        pokemonName: 'pikachu',
        imageUrl: 'https://example.com/p.png',
        note: 'new note',
      }),
    );
  });
});
