import { Inject, Injectable } from '@nestjs/common';
import {
  IPokemonCatalogPort,
  PokemonDetail,
  POKEMON_CATALOG,
} from '../ports/pokemon-catalog.port';

@Injectable()
export class GetPokemonDetailUseCase {
  constructor(
    @Inject(POKEMON_CATALOG)
    private readonly catalog: IPokemonCatalogPort,
  ) {}

  execute(idOrName: string): Promise<PokemonDetail> {
    return this.catalog.getById(idOrName);
  }
}
