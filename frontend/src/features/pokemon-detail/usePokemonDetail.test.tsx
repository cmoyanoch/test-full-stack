import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as pokeApi from '../../api/pokemon';
import type { PokemonDetail } from '../../api/pokemon';
import type { AppView } from '../../shared/types/app-view';
import { usePokemonDetail } from './usePokemonDetail';

vi.mock('../../api/pokemon', () => ({
  fetchPokemonDetail: vi.fn(),
}));

const sampleDetail = (id: number): PokemonDetail => ({
  id,
  name: `pokemon-${id}`,
  imageUrl: 'https://example.com/img.png',
  types: ['grass'],
  stats: [{ name: 'hp', baseStat: 45 }],
});

describe('usePokemonDetail', () => {
  const goToDetailView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    goToDetailView.mockClear();
  });

  it('openPokemonDetail sets id and calls navigation', async () => {
    vi.mocked(pokeApi.fetchPokemonDetail).mockResolvedValue(sampleDetail(5));

    const { result, rerender } = renderHook(
      ({ view }) => usePokemonDetail(view, goToDetailView),
      { initialProps: { view: 'list' as AppView } },
    );

    await act(async () => {
      result.current.openPokemonDetail('5');
    });

    expect(goToDetailView).toHaveBeenCalled();
    expect(result.current.detailId).toBe('5');

    rerender({ view: 'detail' });

    await waitFor(() => {
      expect(result.current.detailLoading).toBe(false);
      expect(result.current.detail?.id).toBe(5);
    });
    expect(result.current.detailError).toBeNull();
    expect(pokeApi.fetchPokemonDetail).toHaveBeenCalledWith(
      '5',
      expect.any(AbortSignal),
    );
  });

  it('sets detailError when fetch fails', async () => {
    vi.mocked(pokeApi.fetchPokemonDetail).mockRejectedValue(
      new Error('upstream'),
    );

    const { result, rerender } = renderHook(
      ({ view }) => usePokemonDetail(view, goToDetailView),
      { initialProps: { view: 'list' as AppView } },
    );

    await act(async () => {
      result.current.openPokemonDetail('99');
    });
    rerender({ view: 'detail' });

    await waitFor(() => {
      expect(result.current.detailLoading).toBe(false);
      expect(result.current.detailError).toBe('upstream');
    });
    expect(result.current.detail).toBeNull();
  });

  it('does not fetch again when same id is already cached', async () => {
    vi.mocked(pokeApi.fetchPokemonDetail).mockResolvedValue(sampleDetail(7));

    const { result, rerender } = renderHook(
      ({ view }) => usePokemonDetail(view, goToDetailView),
      { initialProps: { view: 'list' as AppView } },
    );

    await act(async () => {
      result.current.openPokemonDetail('7');
    });
    rerender({ view: 'detail' });

    await waitFor(() =>
      expect(result.current.detail?.name).toBe('pokemon-7'),
    );
    expect(pokeApi.fetchPokemonDetail).toHaveBeenCalledTimes(1);

    rerender({ view: 'list' });

    await act(async () => {
      result.current.openPokemonDetail('7');
    });
    rerender({ view: 'detail' });

    await waitFor(() =>
      expect(result.current.detail?.name).toBe('pokemon-7'),
    );
    expect(pokeApi.fetchPokemonDetail).toHaveBeenCalledTimes(1);
  });

  it('aborts in-flight fetch when detailId changes before resolve', async () => {
    let resolveFirst!: (v: PokemonDetail) => void;
    const firstPending = new Promise<PokemonDetail>((res) => {
      resolveFirst = res;
    });
    vi.mocked(pokeApi.fetchPokemonDetail)
      .mockImplementationOnce(() => firstPending)
      .mockResolvedValueOnce(sampleDetail(2));

    const { result, rerender } = renderHook(
      ({ view }) => usePokemonDetail(view, goToDetailView),
      { initialProps: { view: 'list' as AppView } },
    );

    await act(async () => {
      result.current.openPokemonDetail('1');
    });
    rerender({ view: 'detail' });

    await waitFor(() =>
      expect(pokeApi.fetchPokemonDetail).toHaveBeenCalledWith(
        '1',
        expect.any(AbortSignal),
      ),
    );

    await act(async () => {
      result.current.openPokemonDetail('2');
    });

    resolveFirst(sampleDetail(1));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    rerender({ view: 'detail' });

    await waitFor(() =>
      expect(result.current.detail?.id).toBe(2),
    );
    expect(result.current.detail?.name).toBe('pokemon-2');
  });
});
