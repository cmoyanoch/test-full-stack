import { useEffect, useState } from 'react';
import type { AppView } from '../../shared/types/app-view';
import * as pokeApi from '../../api/pokemon';
import type { PokemonSummary } from '../../api/pokemon';
import { PAGE_LIMIT } from './constants';

export function usePokemonList(view: AppView, offset: number) {
  const limit = PAGE_LIMIT;
  const [list, setList] = useState<{
    items: PokemonSummary[];
    total: number;
    nextOffset: number | null;
  } | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listBusy, setListBusy] = useState(false);

  useEffect(() => {
    if (view !== 'list') return;
    let cancelled = false;
    setListBusy(true);
    void (async () => {
      try {
        setListError(null);
        const data = await pokeApi.fetchPokemonPage(offset, limit);
        if (!cancelled) setList(data);
      } catch (e) {
        if (!cancelled)
          setListError(e instanceof Error ? e.message : 'Error lista');
      } finally {
        if (!cancelled) setListBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, offset, limit]);

  return { list, listError, listBusy, pageLimit: limit };
}
