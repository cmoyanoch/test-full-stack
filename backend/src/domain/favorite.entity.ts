export class Favorite {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly pokemonId: number,
    public readonly pokemonName: string,
    public readonly imageUrl: string,
    public note: string | null,
    public readonly createdAt: Date,
  ) {}
}
