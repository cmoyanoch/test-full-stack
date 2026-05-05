import { Inject, Injectable } from '@nestjs/common';
import {
  IPokemonCatalogPort,
  PokemonListResult,
  POKEMON_CATALOG,
} from '../ports/pokemon-catalog.port';

@Injectable()
export class ListPokemonPageUseCase {
  constructor(
    @Inject(POKEMON_CATALOG)
    private readonly catalog: IPokemonCatalogPort,
  ) {}

  execute(offset: number, limit: number): Promise<PokemonListResult> {
    return this.catalog.list(offset, limit);
  }
}
