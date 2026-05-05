import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as favApi from '../../api/favorites';
import { useFavorites } from './useFavorites';

vi.mock('../../api/favorites', () => ({
  fetchFavorites: vi.fn(),
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
  patchFavoriteNote: vi.fn(),
}));

describe('useFavorites', () => {
  const pushToastError = vi.fn();

  beforeEach(() => {
    vi.mocked(favApi.fetchFavorites).mockResolvedValue([]);
    vi.clearAllMocks();
  });

  it('loads favorites on mount', async () => {
    vi.mocked(favApi.fetchFavorites).mockResolvedValue([
      {
        id: 'a',
        clientId: 'c1',
        pokemonId: 1,
        pokemonName: 'bulbasaur',
        imageUrl: 'https://example.com/1.png',
        note: null,
        createdAt: '2020-01-01T00:00:00.000Z',
      },
    ]);

    const { result } = renderHook(() => useFavorites(pushToastError));

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].pokemonId).toBe(1);
    });
    expect(favApi.fetchFavorites).toHaveBeenCalled();
  });

  it('sets favError when fetch fails', async () => {
    vi.mocked(favApi.fetchFavorites).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useFavorites(pushToastError));

    await waitFor(() => {
      expect(result.current.favError).toBe('network');
    });
  });

  it('addCurrentFavorite creates and reloads list', async () => {
    vi.mocked(favApi.fetchFavorites)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'new-id',
          clientId: 'c1',
          pokemonId: 25,
          pokemonName: 'pikachu',
          imageUrl: 'x',
          note: null,
          createdAt: '2020-01-01T00:00:00.000Z',
        },
      ]);
    vi.mocked(favApi.createFavorite).mockResolvedValue({
      id: 'new-id',
      clientId: 'c1',
      pokemonId: 25,
      pokemonName: 'pikachu',
      imageUrl: 'x',
      note: null,
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useFavorites(pushToastError));

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(0);
    });

    await act(async () => {
      await result.current.addCurrentFavorite(
        {
          id: 25,
          name: 'pikachu',
          imageUrl: 'x',
          types: [],
          stats: [],
        },
        '25',
      );
    });

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1);
    });
    expect(favApi.createFavorite).toHaveBeenCalledWith(25, 'pikachu', 'x');
  });

  it('removeFavorite calls API and reloads', async () => {
    vi.mocked(favApi.fetchFavorites)
      .mockResolvedValueOnce([
        {
          id: 'x',
          clientId: 'c1',
          pokemonId: 1,
          pokemonName: 'bulbasaur',
          imageUrl: 'https://example.com/1.png',
          note: null,
          createdAt: '2020-01-01T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(favApi.deleteFavorite).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFavorites(pushToastError));

    await waitFor(() => expect(result.current.favorites).toHaveLength(1));

    await act(async () => {
      await result.current.removeFavorite('x');
    });

    await waitFor(() => expect(result.current.favorites).toHaveLength(0));
    expect(favApi.deleteFavorite).toHaveBeenCalledWith('x');
  });
});
