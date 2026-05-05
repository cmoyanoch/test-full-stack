import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppView } from '../../shared/types/app-view';
import * as pokeApi from '../../api/pokemon';
import type { PokemonDetail } from '../../api/pokemon';

export function usePokemonDetail(view: AppView, goToDetailView: () => void) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailCacheRef = useRef(new Map<string, PokemonDetail>());

  const openPokemonDetail = useCallback(
    (pid: string) => {
      const cached = detailCacheRef.current.get(pid);
      setDetailId(pid);
      goToDetailView();
      if (cached) {
        setDetail(cached);
        setDetailLoading(false);
        setDetailError(null);
      } else {
        setDetail(null);
        setDetailLoading(true);
        setDetailError(null);
      }
    },
    [goToDetailView],
  );

  useEffect(() => {
    if (view !== 'detail' || !detailId) return;

    const cached = detailCacheRef.current.get(detailId);
    if (cached) {
      setDetail(cached);
      setDetailLoading(false);
      setDetailError(null);
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      try {
        const d = await pokeApi.fetchPokemonDetail(detailId, ac.signal);
        if (!cancelled) {
          detailCacheRef.current.set(detailId, d);
          setDetail(d);
        }
      } catch (e) {
        const aborted =
          (typeof DOMException !== 'undefined' &&
            e instanceof DOMException &&
            e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError');
        if (cancelled || aborted) return;
        setDetailError(e instanceof Error ? e.message : 'Error detalle');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [view, detailId]);

  return {
    detailId,
    detail,
    detailLoading,
    detailError,
    openPokemonDetail,
  };
}
