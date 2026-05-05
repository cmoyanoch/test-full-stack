import { Module } from '@nestjs/common';
import { AddFavoriteUseCase } from '../application/use-cases/add-favorite.use-case';
import { ListFavoritesUseCase } from '../application/use-cases/list-favorites.use-case';
import { RemoveFavoriteUseCase } from '../application/use-cases/remove-favorite.use-case';
import { UpdateFavoriteNoteUseCase } from '../application/use-cases/update-favorite-note.use-case';
import { REALTIME_NOTIFIER } from '../application/ports/realtime-notifier.port';
import { DatabaseModule } from '../infrastructure/persistence/database.module';
import { FavoritesController } from '../presentation/favorites.controller';
import { RealtimeGateway } from '../presentation/realtime.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [FavoritesController],
  providers: [
    RealtimeGateway,
    { provide: REALTIME_NOTIFIER, useExisting: RealtimeGateway },
    ListFavoritesUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    UpdateFavoriteNoteUseCase,
  ],
})
export class FavoritesModule {}
