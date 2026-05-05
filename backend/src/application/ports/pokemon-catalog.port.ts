export interface PokemonSummary {
  name: string;
  url: string;
}

export interface PokemonListResult {
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

export interface IPokemonCatalogPort {
  list(offset: number, limit: number): Promise<PokemonListResult>;
  getById(idOrName: string): Promise<PokemonDetail>;
}

export const POKEMON_CATALOG = Symbol('IPokemonCatalogPort');
