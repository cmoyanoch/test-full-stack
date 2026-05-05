export class DuplicateFavoriteError extends Error {
  constructor(public readonly pokemonId: number) {
    super(`Favorite already exists for pokemonId ${pokemonId}`);
    this.name = 'DuplicateFavoriteError';
  }
}

export class FavoriteNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Favorite not found: ${id}`);
    this.name = 'FavoriteNotFoundError';
  }
}
