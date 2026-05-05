import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import Visibility from '@mui/icons-material/Visibility';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FavoriteDto } from '../../api/favorites';
import { ListPaginationFooter } from '../../shared/components/ListPaginationFooter';
import { ListSectionCard } from '../../shared/components/ListSectionCard';

const PAGE_SIZE = 4;

function displayPokemonTitle(f: FavoriteDto): string {
  const name = f.pokemonName?.trim();
  if (name) return name;
  return `Pokémon #${f.pokemonId}`;
}

type FavoritesViewProps = {
  favorites: FavoriteDto[];
  favError: string | null;
  noteDrafts: Record<string, string>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  onExploreList: () => void;
  onOpenPokemonDetail: (pokemonId: string) => void;
  onSaveNote: (id: string) => void;
  onRemoveFavorite: (id: string) => void;
};

export function FavoritesView({
  favorites,
  favError,
  noteDrafts,
  setNoteDrafts,
  onExploreList,
  onOpenPokemonDetail,
  onSaveNote,
  onRemoveFavorite,
}: FavoritesViewProps) {
  const [page, setPage] = useState(0);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(favorites.length / PAGE_SIZE)),
    [favorites.length],
  );

  useEffect(() => {
    if (favorites.length === 0) {
      setPage(0);
      return;
    }
    const lastIndex = pageCount - 1;
    setPage((p) => Math.min(p, lastIndex));
  }, [favorites.length, pageCount]);

  const pagedFavorites = useMemo(() => {
    const start = page * PAGE_SIZE;
    return favorites.slice(start, start + PAGE_SIZE);
  }, [favorites, page]);

  return (
    <ListSectionCard
      title="Favoritos"
      headerAside={
        favorites.length > 0 ? (
          <Typography
            component="p"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            Total guardados: {favorites.length}.
          </Typography>
        ) : undefined
      }
      error={
        favError ? (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {favError}
          </Alert>
        ) : undefined
      }
    >
      {favorites.length === 0 ? (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography color="text.secondary">
            Aún no tienes favoritos. Explora el listado y añade los que quieras
            conservar.
          </Typography>
          <Button variant="contained" onClick={onExploreList}>
            Explorar Pokémon
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              stickyHeader
              aria-label="Favoritos guardados"
            >
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Pokémon</TableCell>
                  <TableCell scope="col" sx={{ minWidth: 200 }}>
                    Nota
                  </TableCell>
                  <TableCell
                    scope="col"
                    align="right"
                    sx={{ width: 132, minWidth: 132 }}
                  >
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedFavorites.map((f) => {
                  const title = displayPokemonTitle(f);
                  return (
                    <TableRow key={f.id} hover>
                      <TableCell sx={{ verticalAlign: 'middle' }}>
                        <Stack
                          direction="column"
                          spacing={1}
                          sx={{ alignItems: 'center'}}
                        >
                          <Stack spacing={1} sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {title}
                            </Typography>

                          </Stack>
                          <Avatar
                            variant="rounded"
                            src={f.imageUrl || undefined}
                            alt={title}
                            slotProps={{ img: { loading: 'lazy' } }}
                            sx={{ width: 72, height: 72 }}
                          />

                        </Stack>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'middle' }}>
                        <TextField
                          label="Nota"
                          size="small"
                          fullWidth
                          sx={{ minWidth: 160 }}
                          value={
                            noteDrafts[f.id] !== undefined
                              ? noteDrafts[f.id]
                              : (f.note ?? '')
                          }
                          onChange={(e) =>
                            setNoteDrafts((d) => ({
                              ...d,
                              [f.id]: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                          }}
                        >
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label={`Ver detalle de ${title}`}
                              onClick={() =>
                                onOpenPokemonDetail(String(f.pokemonId))
                              }
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Guardar nota">
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label={`Guardar nota para ${title}`}
                              onClick={() => void onSaveNote(f.id)}
                              sx={{
                                border: 1,
                                borderColor: 'primary.main',
                              }}
                            >
                              <SaveOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar de favoritos">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={`Eliminar ${title} de favoritos`}
                              onClick={() => void onRemoveFavorite(f.id)}
                              sx={{
                                border: 1,
                                borderColor: 'error.main',
                              }}
                            >
                              <DeleteOutlineOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <ListPaginationFooter
            count={favorites.length}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            ariaLabel="Paginación de favoritos"
          />
        </Stack>
      )}
    </ListSectionCard>
  );
}
