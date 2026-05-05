import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { GetPokemonDetailUseCase } from '../application/use-cases/get-pokemon-detail.use-case';
import { ListPokemonPageUseCase } from '../application/use-cases/list-pokemon-page.use-case';
import { DomainToHttpFilter } from './http-exception.filter';

@Controller('pokemon')
@UseFilters(DomainToHttpFilter)
export class PokemonController {
  constructor(
    private readonly listPage: ListPokemonPageUseCase,
    private readonly getDetail: GetPokemonDetailUseCase,
  ) {}

  @Get()
  async list(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const lim = Math.min(Math.max(limit, 1), 100);
    const off = Math.max(offset, 0);
    return this.listPage.execute(off, lim);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.getDetail.execute(id);
  }
}
