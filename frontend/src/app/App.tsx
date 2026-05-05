import { useCallback, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import { FavoritesView } from '../features/favorites/FavoritesView';
import { useFavoriteSocket } from '../features/favorites/useFavoriteSocket';
import { useFavorites } from '../features/favorites/useFavorites';
import { PokemonDetailView } from '../features/pokemon-detail/PokemonDetailView';
import { usePokemonDetail } from '../features/pokemon-detail/usePokemonDetail';
import { PokemonListView } from '../features/pokemon-list/PokemonListView';
import { usePokemonList } from '../features/pokemon-list/usePokemonList';
import { AppNavigation } from '../shared/components/AppNavigation';
import { ToastStack } from '../shared/components/ToastStack';
import { useToasts } from '../shared/hooks/useToasts';
import type { AppView } from '../shared/types/app-view';

export default function App() {
  const [view, setView] = useState<AppView>('list');
  const [offset, setOffset] = useState(0);

  const { toasts, pushToast, pushToastError } = useToasts();

  const {
    favorites,
    favError,
    noteDrafts,
    setNoteDrafts,
    loadFavorites,
    addCurrentFavorite,
    addFavoriteBusy,
    removeFavorite,
    saveNote,
    recentLocalFavoriteIds,
  } = useFavorites(pushToastError);

  useFavoriteSocket(loadFavorites, pushToast, recentLocalFavoriteIds);

  const goToDetailView = useCallback(() => setView('detail'), []);

  const { list, listError, listBusy, pageLimit } = usePokemonList(
    view,
    offset,
  );

  const {
    detailId,
    detail,
    detailLoading,
    detailError,
    openPokemonDetail,
  } = usePokemonDetail(view, goToDetailView);

  const favByPokemonId = useMemo(
    () => new Map(favorites.map((f) => [f.pokemonId, f])),
    [favorites],
  );

  const detailMatchesSelection =
    detail != null &&
    detailId != null &&
    String(detail.id) === detailId;

  const showDetailLoading =
    !!detailId &&
    !detailError &&
    (detailLoading || !detailMatchesSelection);

  const showListSkeleton = view === 'list' && listBusy;

  const isFavorite =
    detail != null && favByPokemonId.has(detail.id);

  return (
    <>
      <AppNavigation
        view={view}
        favoritesCount={favorites.length}
        onNavigateToList={() => setView('list')}
        onNavigateToFavorites={() => setView('favorites')}
      />

      <Container
        maxWidth={false}
        sx={{
          maxWidth:
            view === 'detail' ? 480 : view === 'favorites' ? 800 : 600,
          mx: 'auto',
          px: 3,
          py: 2,
        }}
      >
        {view === 'list' && (
          <PokemonListView
            list={list}
            listError={listError}
            showListSkeleton={showListSkeleton}
            offset={offset}
            pageLimit={pageLimit}
            onPageChange={(newPage) => setOffset(newPage * pageLimit)}
            onOpenDetail={openPokemonDetail}
          />
        )}

        {view === 'detail' && (
          <PokemonDetailView
            showDetailLoading={showDetailLoading}
            detailError={detailError}
            detailMatchesSelection={detailMatchesSelection}
            detail={detail}
            isFavorite={isFavorite}
            addFavoriteLoading={addFavoriteBusy}
            onAddFavorite={() =>
              void addCurrentFavorite(detail, detailId)
            }
            onBackToList={() => setView('list')}
          />
        )}

        {view === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            favError={favError}
            noteDrafts={noteDrafts}
            setNoteDrafts={setNoteDrafts}
            onExploreList={() => setView('list')}
            onOpenPokemonDetail={openPokemonDetail}
            onSaveNote={(id) => void saveNote(id)}
            onRemoveFavorite={(id) => void removeFavorite(id)}
          />
        )}
      </Container>

      <ToastStack toasts={toasts} />
    </>
  );
}
