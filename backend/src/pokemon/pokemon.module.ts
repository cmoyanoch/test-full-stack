import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { POKEMON_CATALOG } from '../application/ports/pokemon-catalog.port';
import { GetPokemonDetailUseCase } from '../application/use-cases/get-pokemon-detail.use-case';
import { ListPokemonPageUseCase } from '../application/use-cases/list-pokemon-page.use-case';
import { PokeApiCatalogAdapter } from '../infrastructure/pokemon/pokeapi-catalog.adapter';
import { PokemonController } from '../presentation/pokemon.controller';

@Module({
  imports: [HttpModule],
  controllers: [PokemonController],
  providers: [
    PokeApiCatalogAdapter,
    { provide: POKEMON_CATALOG, useExisting: PokeApiCatalogAdapter },
    ListPokemonPageUseCase,
    GetPokemonDetailUseCase,
  ],
})
export class PokemonModule {}
