import { useEffect, type MutableRefObject } from 'react';
import { io } from 'socket.io-client';
import { apiBase } from '../../api/config';
import { getOrCreateClientId } from '../../utils/clientId';

export function useFavoriteSocket(
  loadFavorites: () => Promise<void>,
  pushToast: (msg: string) => void,
  recentLocalFavoriteIds: MutableRefObject<Set<string>>,
) {
  useEffect(() => {
    const clientId = getOrCreateClientId();
    const socket = io(apiBase(), {
      transports: ['websocket', 'polling'],
      auth: { clientId },
    });

    const onAdded = (payload: {
      clientId: string;
      favoriteId: string;
      pokemonId: number;
      pokemonName: string;
      imageUrl: string;
      note: string | null;
      createdAt: string;
    }) => {
      if (payload.clientId !== clientId) return;
      if (recentLocalFavoriteIds.current.has(payload.favoriteId)) {
        recentLocalFavoriteIds.current.delete(payload.favoriteId);
        void loadFavorites();
        return;
      }
      const label = payload.pokemonName?.trim()
        ? payload.pokemonName
        : `#${payload.pokemonId}`;
      pushToast(`Favorito añadido remotamente (${label})`);
      void loadFavorites();
    };

    const onRemoved = (payload: {
      clientId: string;
      favoriteId: string;
      pokemonId: number;
    }) => {
      if (payload.clientId !== clientId) return;
      pushToast(`Favorito eliminado remotamente (#${payload.pokemonId})`);
      void loadFavorites();
    };

    const onUpdated = (payload: {
      clientId: string;
      favoriteId: string;
      pokemonId: number;
      pokemonName: string;
      imageUrl: string;
      note: string | null;
      createdAt: string;
    }) => {
      if (payload.clientId !== clientId) return;
      pushToast(`Nota actualizada remotamente (#${payload.pokemonId})`);
      void loadFavorites();
    };

    socket.on('favorite:added', onAdded);
    socket.on('favorite:removed', onRemoved);
    socket.on('favorite:updated', onUpdated);

    return () => {
      socket.off('favorite:added', onAdded);
      socket.off('favorite:removed', onRemoved);
      socket.off('favorite:updated', onUpdated);
      socket.disconnect();
    };
  }, [loadFavorites, pushToast]);
}
