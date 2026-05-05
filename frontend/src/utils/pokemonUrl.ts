/** Extrae el id numérico final de una URL de recurso de PokéAPI (p. ej. .../pokemon/25/). */
export function idFromPokemonUrl(url: string): string {
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] ?? '';
}
