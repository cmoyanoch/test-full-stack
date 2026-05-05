import { apiBase } from './config';
import { clientHeaders } from './clientHeaders';

export interface PokemonSummary {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  items: PokemonSummary[];
  total: number;
  nextOffset: number | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  stats: { name: string; baseStat: number }[];
}

export async function fetchPokemonPage(
  offset: number,
  limit: number,
): Promise<PokemonListResponse> {
  const r = await fetch(
    `${apiBase()}/pokemon?offset=${offset}&limit=${limit}`,
    { headers: clientHeaders() },
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function fetchPokemonDetail(
  idOrName: string,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const r = await fetch(
    `${apiBase()}/pokemon/${encodeURIComponent(idOrName)}`,
    { signal, headers: clientHeaders() },
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
