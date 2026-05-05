import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FavoriteDto } from '../../api/favorites';
import { FavoritesView } from './FavoritesView';

function mkFavorite(i: number): FavoriteDto {
  return {
    id: `fav-id-${i}`,
    clientId: 'client',
    pokemonId: i,
    pokemonName: `pokemon-${i}`,
    imageUrl: `https://example.com/${i}.png`,
    note: null,
    createdAt: '2020-01-01T00:00:00.000Z',
  };
}

describe('FavoritesView', () => {
  const noop = vi.fn();

  it('opens pokemon detail when clicking visibility icon', () => {
    const favorites = [mkFavorite(1)];
    const onOpenPokemonDetail = vi.fn();

    render(
      <FavoritesView
        favorites={favorites}
        favError={null}
        noteDrafts={{}}
        setNoteDrafts={noop}
        onExploreList={noop}
        onOpenPokemonDetail={onOpenPokemonDetail}
        onSaveNote={noop}
        onRemoveFavorite={noop}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ver detalle de pokemon-1/,
      }),
    );

    expect(onOpenPokemonDetail).toHaveBeenCalledTimes(1);
    expect(onOpenPokemonDetail).toHaveBeenCalledWith('1');
  });

  it('shows pagination and second page items when more than 4 favorites', () => {
    const favorites = [1, 2, 3, 4, 5, 6].map(mkFavorite);

    render(
      <FavoritesView
        favorites={favorites}
        favError={null}
        noteDrafts={{}}
        setNoteDrafts={noop}
        onExploreList={noop}
        onOpenPokemonDetail={noop}
        onSaveNote={noop}
        onRemoveFavorite={noop}
      />,
    );

    expect(screen.getByText('pokemon-1')).toBeInTheDocument();
    expect(screen.getByText('pokemon-4')).toBeInTheDocument();
    expect(screen.queryByText('pokemon-5')).not.toBeInTheDocument();

    expect(
      screen.getByText('Mostrando 1–4 de 6', { exact: false }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir a la página 2' }));

    expect(screen.queryByText('pokemon-1')).not.toBeInTheDocument();
    expect(screen.getByText('pokemon-5')).toBeInTheDocument();
    expect(screen.getByText('pokemon-6')).toBeInTheDocument();
    expect(
      screen.getByText('Mostrando 5–6 de 6', { exact: false }),
    ).toBeInTheDocument();
  });

  it('hides pagination when 4 or fewer favorites', () => {
    const favorites = [1, 2, 3, 4].map(mkFavorite);

    render(
      <FavoritesView
        favorites={favorites}
        favError={null}
        noteDrafts={{}}
        setNoteDrafts={noop}
        onExploreList={noop}
        onOpenPokemonDetail={noop}
        onSaveNote={noop}
        onRemoveFavorite={noop}
      />,
    );

    expect(
      screen.queryByRole('navigation', { name: 'Paginación de favoritos' }),
    ).not.toBeInTheDocument();
  });
});
