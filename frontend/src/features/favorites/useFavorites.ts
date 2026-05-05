import { useCallback, useEffect, useRef, useState } from 'react';
import * as favApi from '../../api/favorites';
import type { FavoriteDto } from '../../api/favorites';
import type { PokemonDetail } from '../../api/pokemon';

export function useFavorites(pushToastError: (msg: string) => void) {
  const recentLocalFavoriteIds = useRef(new Set<string>());
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [favError, setFavError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [addFavoriteBusy, setAddFavoriteBusy] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      setFavError(null);
      const rows = await favApi.fetchFavorites();
      setFavorites(rows);
    } catch (e) {
      setFavError(e instanceof Error ? e.message : 'Error favoritos');
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const addCurrentFavorite = useCallback(
    async (detail: PokemonDetail | null, detailId: string | null) => {
      if (!detail || String(detail.id) !== (detailId ?? '')) return;
      setAddFavoriteBusy(true);
      try {
        const created = await favApi.createFavorite(
          detail.id,
          detail.name,
          detail.imageUrl,
        );
        recentLocalFavoriteIds.current.add(created.id);
        await loadFavorites();
      } catch (e) {
        pushToastError(
          e instanceof Error ? e.message : 'No se pudo agregar a favoritos.',
        );
      } finally {
        setAddFavoriteBusy(false);
      }
    },
    [loadFavorites, pushToastError],
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      try {
        await favApi.deleteFavorite(id);
        await loadFavorites();
      } catch (e) {
        pushToastError(
          e instanceof Error ? e.message : 'No se pudo eliminar el favorito.',
        );
      }
    },
    [loadFavorites, pushToastError],
  );

  const saveNote = useCallback(
    async (id: string) => {
      const raw = noteDrafts[id];
      const note = raw === undefined ? null : raw;
      try {
        await favApi.patchFavoriteNote(id, note);
        await loadFavorites();
      } catch (e) {
        pushToastError(
          e instanceof Error ? e.message : 'No se pudo guardar la nota.',
        );
      }
    },
    [noteDrafts, loadFavorites, pushToastError],
  );

  return {
    favorites,
    favError,
    noteDrafts,
    setNoteDrafts,
    loadFavorites,
    addCurrentFavorite,
    addFavoriteBusy,
    removeFavorite,
    saveNote,
    recentLocalFavoriteIds,
  };
}
