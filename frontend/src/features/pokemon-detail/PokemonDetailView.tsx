import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { PokemonDetail } from '../../api/pokemon';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { PokemonDetailImage } from './PokemonDetailImage';

type PokemonDetailViewProps = {
  showDetailLoading: boolean;
  detailError: string | null;
  detailMatchesSelection: boolean;
  detail: PokemonDetail | null;
  isFavorite: boolean;
  addFavoriteLoading: boolean;
  onAddFavorite: () => void;
  onBackToList: () => void;
};

export function PokemonDetailView({
  showDetailLoading,
  detailError,
  detailMatchesSelection,
  detail,
  isFavorite,
  addFavoriteLoading,
  onAddFavorite,
  onBackToList,
}: PokemonDetailViewProps) {
  return (
    <Card variant="outlined" aria-busy={showDetailLoading}>
      <CardContent>
        {showDetailLoading && (
          <LoadingIndicator label="Cargando detalle…" sx={{ mb: 2 }} />
        )}
        {detailError && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {detailError}
          </Alert>
        )}
        {detailMatchesSelection && detail && (
          <>
            <Stack
              direction="column"
              spacing={2}
              sx={{
                mb: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ textTransform: 'capitalize', flex: '1 1 auto' }}
              >
                {detail.name}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                mb: 2,
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}
            >
              {detail.imageUrl ? (
                <PokemonDetailImage
                  imageUrl={detail.imageUrl}
                  pokemonId={detail.id}
                />
              ) : null}
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Tipos
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {detail.types.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" component="h2" gutterBottom>
              Stats
            </Typography>
            <TableContainer sx={{ maxWidth: 420 }}>
              <Table size="small" aria-label="Estadísticas base">
                <TableHead>
                  <TableRow>
                    <TableCell>Stat</TableCell>
                    <TableCell align="right">Valor base</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.stats.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell component="th" scope="row">
                        {s.name}
                      </TableCell>
                      <TableCell align="right">{s.baseStat}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              component="section"
              sx={{
                mt: 2,
                pt: 1,
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box aria-live="polite" sx={{ minWidth: 0 }}>
                {isFavorite ? (
                  <Chip
                    icon={<Favorite aria-hidden />}
                    label="Favorito"
                    color="success"
                    variant="outlined"
                    size="medium"
                  />
                ) : (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<FavoriteBorder />}
                    loading={addFavoriteLoading}
                    onClick={() => void onAddFavorite()}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    }}
                  >
                    Añadir a favoritos
                  </Button>
                )}
              </Box>
              <Button
                variant="outlined"
                size="medium"
                onClick={onBackToList}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                }}
              >
                Volver al listado
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
