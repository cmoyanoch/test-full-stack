import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as pokeApi from '../../api/pokemon';
import { usePokemonList } from './usePokemonList';
import { PAGE_LIMIT } from './constants';

vi.mock('../../api/pokemon', () => ({
  fetchPokemonPage: vi.fn(),
}));

describe('usePokemonList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when view is not list', async () => {
    vi.mocked(pokeApi.fetchPokemonPage).mockResolvedValue({
      items: [],
      total: 0,
      nextOffset: null,
    });

    renderHook(() => usePokemonList('favorites', 0));

    await act(async () => {
      await Promise.resolve();
    });

    expect(pokeApi.fetchPokemonPage).not.toHaveBeenCalled();
  });

  it('loads page when view is list', async () => {
    vi.mocked(pokeApi.fetchPokemonPage).mockResolvedValue({
      items: [{ name: 'bulbasaur', url: 'https://example.com/1/' }],
      total: 151,
      nextOffset: 10,
    });

    const { result } = renderHook(() => usePokemonList('list', 0));

    await waitFor(() => {
      expect(result.current.listBusy).toBe(false);
    });

    expect(result.current.list?.items).toHaveLength(1);
    expect(result.current.list?.total).toBe(151);
    expect(result.current.listError).toBeNull();
    expect(pokeApi.fetchPokemonPage).toHaveBeenCalledWith(0, PAGE_LIMIT);
  });

  it('sets listError when fetch fails', async () => {
    vi.mocked(pokeApi.fetchPokemonPage).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => usePokemonList('list', 0));

    await waitFor(() => {
      expect(result.current.listBusy).toBe(false);
    });

    expect(result.current.listError).toBe('boom');
    expect(result.current.list).toBeNull();
  });

  it('refetches when offset changes', async () => {
    vi.mocked(pokeApi.fetchPokemonPage).mockResolvedValue({
      items: [],
      total: 0,
      nextOffset: null,
    });

    const { result, rerender } = renderHook(
      ({ offset }) => usePokemonList('list', offset),
      { initialProps: { offset: 0 } },
    );

    await waitFor(() => expect(result.current.listBusy).toBe(false));
    expect(pokeApi.fetchPokemonPage).toHaveBeenCalledWith(0, PAGE_LIMIT);

    rerender({ offset: 20 });

    await waitFor(() => {
      expect(pokeApi.fetchPokemonPage).toHaveBeenCalledWith(20, PAGE_LIMIT);
    });
  });
});
