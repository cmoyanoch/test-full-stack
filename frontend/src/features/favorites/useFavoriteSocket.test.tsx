import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { io } from 'socket.io-client';
import { useFavoriteSocket } from './useFavoriteSocket';

const socketMocks = vi.hoisted(() => {
  const handlers: Record<string, (payload: unknown) => void> = {};
  const mockSocket = {
    on: vi.fn((event: string, fn: (p: unknown) => void) => {
      handlers[event] = fn;
    }),
    off: vi.fn(),
    disconnect: vi.fn(),
  };
  return { handlers, mockSocket };
});

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => socketMocks.mockSocket),
}));

vi.mock('../../api/config', () => ({
  apiBase: () => 'http://localhost:4000',
}));

vi.mock('../../utils/clientId', () => ({
  getOrCreateClientId: () => 'vitest-socket-client',
}));

describe('useFavoriteSocket', () => {
  const loadFavorites = vi.fn().mockResolvedValue(undefined);
  const pushToast = vi.fn();
  const recentRef = { current: new Set<string>() };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(socketMocks.handlers).forEach((k) => {
      delete socketMocks.handlers[k];
    });
    recentRef.current = new Set<string>();
  });

  it('registers socket listeners and disconnects on unmount', () => {
    const { unmount } = renderHook(() =>
      useFavoriteSocket(loadFavorites, pushToast, recentRef),
    );

    expect(vi.mocked(io)).toHaveBeenCalledWith(
      'http://localhost:4000',
      expect.objectContaining({
        auth: { clientId: 'vitest-socket-client' },
        transports: ['websocket', 'polling'],
      }),
    );

    expect(socketMocks.mockSocket.on).toHaveBeenCalledWith(
      'favorite:added',
      expect.any(Function),
    );
    expect(socketMocks.mockSocket.on).toHaveBeenCalledWith(
      'favorite:removed',
      expect.any(Function),
    );
    expect(socketMocks.mockSocket.on).toHaveBeenCalledWith(
      'favorite:updated',
      expect.any(Function),
    );

    unmount();
    expect(socketMocks.mockSocket.disconnect).toHaveBeenCalled();
  });

  it('on favorite:added remote shows toast and reloads', () => {
    renderHook(() =>
      useFavoriteSocket(loadFavorites, pushToast, recentRef),
    );

    socketMocks.handlers['favorite:added']?.({
      clientId: 'vitest-socket-client',
      favoriteId: 'f1',
      pokemonId: 7,
      pokemonName: 'squirtle',
      imageUrl: 'https://example.com/7.png',
      note: null,
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    expect(pushToast).toHaveBeenCalledWith(
      'Favorito añadido remotamente (squirtle)',
    );
    expect(loadFavorites).toHaveBeenCalled();
  });

  it('on favorite:added own recent id skips toast', () => {
    recentRef.current.add('mine');
    renderHook(() =>
      useFavoriteSocket(loadFavorites, pushToast, recentRef),
    );

    socketMocks.handlers['favorite:added']?.({
      clientId: 'vitest-socket-client',
      favoriteId: 'mine',
      pokemonId: 7,
      pokemonName: '',
      imageUrl: '',
      note: null,
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    expect(pushToast).not.toHaveBeenCalled();
    expect(loadFavorites).toHaveBeenCalled();
    expect(recentRef.current.has('mine')).toBe(false);
  });

  it('on favorite:removed shows toast and reloads', () => {
    renderHook(() =>
      useFavoriteSocket(loadFavorites, pushToast, recentRef),
    );

    socketMocks.handlers['favorite:removed']?.({
      clientId: 'vitest-socket-client',
      favoriteId: 'f1',
      pokemonId: 3,
    });

    expect(pushToast).toHaveBeenCalledWith(
      'Favorito eliminado remotamente (#3)',
    );
    expect(loadFavorites).toHaveBeenCalled();
  });

  it('on favorite:updated shows toast and reloads', () => {
    renderHook(() =>
      useFavoriteSocket(loadFavorites, pushToast, recentRef),
    );

    socketMocks.handlers['favorite:updated']?.({
      clientId: 'vitest-socket-client',
      favoriteId: 'f1',
      pokemonId: 4,
      pokemonName: 'pikachu',
      imageUrl: 'https://example.com/p.png',
      note: 'hi',
      createdAt: '2020-01-01T00:00:00.000Z',
    });

    expect(pushToast).toHaveBeenCalledWith(
      'Nota actualizada remotamente (#4)',
    );
    expect(loadFavorites).toHaveBeenCalled();
  });
});
