import { apiBase } from './config';
import { clientHeaders } from './clientHeaders';

export interface FavoriteDto {
  id: string;
  clientId: string;
  pokemonId: number;
  pokemonName: string;
  imageUrl: string;
  note: string | null;
  createdAt: string;
}

export async function fetchFavorites(): Promise<FavoriteDto[]> {
  const r = await fetch(`${apiBase()}/favorites`, {
    headers: clientHeaders(),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createFavorite(
  pokemonId: number,
  pokemonName: string,
  imageUrl: string,
  note?: string,
): Promise<FavoriteDto> {
  const r = await fetch(`${apiBase()}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...clientHeaders() },
    body: JSON.stringify({ pokemonId, pokemonName, imageUrl, note }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json();
}

export async function deleteFavorite(id: string): Promise<void> {
  const r = await fetch(`${apiBase()}/favorites/${id}`, {
    method: 'DELETE',
    headers: clientHeaders(),
  });
  if (!r.ok) throw new Error(await r.text());
}

export async function patchFavoriteNote(
  id: string,
  note: string | null,
): Promise<FavoriteDto> {
  const r = await fetch(`${apiBase()}/favorites/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...clientHeaders() },
    body: JSON.stringify({ note }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
