export interface FavoriteSocketPayload {
  clientId: string;
  favoriteId: string;
  pokemonId: number;
  pokemonName: string;
  imageUrl: string;
  note: string | null;
  createdAt: string;
}

export interface IRealtimeNotifierPort {
  notifyFavoriteAdded(payload: FavoriteSocketPayload): void;
  notifyFavoriteRemoved(
    payload: Pick<
      FavoriteSocketPayload,
      'clientId' | 'favoriteId' | 'pokemonId'
    >,
  ): void;
  notifyFavoriteUpdated(payload: FavoriteSocketPayload): void;
}

export const REALTIME_NOTIFIER = Symbol('IRealtimeNotifierPort');
