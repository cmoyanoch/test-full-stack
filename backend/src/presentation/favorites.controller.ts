import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { Favorite } from '../domain/favorite.entity';
import { AddFavoriteUseCase } from '../application/use-cases/add-favorite.use-case';
import { ListFavoritesUseCase } from '../application/use-cases/list-favorites.use-case';
import { RemoveFavoriteUseCase } from '../application/use-cases/remove-favorite.use-case';
import { UpdateFavoriteNoteUseCase } from '../application/use-cases/update-favorite-note.use-case';
import { CreateFavoriteDto, UpdateFavoriteNoteDto } from './dto/favorites.dto';
import { DomainToHttpFilter } from './http-exception.filter';
import { resolveClientId } from './client-id';

function toResponse(f: Favorite) {
  return {
    id: f.id,
    clientId: f.clientId,
    pokemonId: f.pokemonId,
    pokemonName: f.pokemonName,
    imageUrl: f.imageUrl,
    note: f.note,
    createdAt: f.createdAt.toISOString(),
  };
}

@Controller('favorites')
@UseFilters(DomainToHttpFilter)
export class FavoritesController {
  constructor(
    private readonly listFavorites: ListFavoritesUseCase,
    private readonly addFavorite: AddFavoriteUseCase,
    private readonly removeFavorite: RemoveFavoriteUseCase,
    private readonly updateNote: UpdateFavoriteNoteUseCase,
  ) {}

  @Get()
  async list(@Headers('x-client-id') clientIdHeader?: string | string[]) {
    const clientId = resolveClientId(clientIdHeader);
    const rows = await this.listFavorites.execute(clientId);
    return rows.map(toResponse);
  }

  @Post()
  async create(
    @Headers('x-client-id') clientIdHeader: string | string[] | undefined,
    @Body() dto: CreateFavoriteDto,
  ) {
    const clientId = resolveClientId(clientIdHeader);
    const fav = await this.addFavorite.execute({
      clientId,
      pokemonId: dto.pokemonId,
      pokemonName: dto.pokemonName,
      imageUrl: dto.imageUrl,
      note: dto.note,
    });
    return toResponse(fav);
  }

  @Delete(':id')
  async remove(
    @Headers('x-client-id') clientIdHeader: string | string[] | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const clientId = resolveClientId(clientIdHeader);
    await this.removeFavorite.execute(clientId, id);
    return { ok: true };
  }

  @Patch(':id')
  async patch(
    @Headers('x-client-id') clientIdHeader: string | string[] | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFavoriteNoteDto,
  ) {
    const clientId = resolveClientId(clientIdHeader);
    const fav = await this.updateNote.execute(clientId, id, dto.note);
    return toResponse(fav);
  }
}
