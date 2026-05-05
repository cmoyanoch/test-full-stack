import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { PokemonSummary } from '../../api/pokemon';
import { ListPaginationFooter } from '../../shared/components/ListPaginationFooter';
import { ListSectionCard } from '../../shared/components/ListSectionCard';
import { idFromPokemonUrl } from '../../utils/pokemonUrl';

type PokemonListViewProps = {
  list: {
    items: PokemonSummary[];
    total: number;
    nextOffset: number | null;
  } | null;
  listError: string | null;
  showListSkeleton: boolean;
  offset: number;
  pageLimit: number;
  onPageChange: (newPage: number) => void;
  onOpenDetail: (pokemonIdFromUrl: string) => void;
};

function listErrorActionableText(listError: string): string {
  return listError.length > 120
    ? `${listError.slice(0, 117)}… Comprueba la conexión o el servidor.`
    : `${listError} Si persiste, revisa la red o el backend.`;
}

export function PokemonListView({
  list,
  listError,
  showListSkeleton,
  offset,
  pageLimit,
  onPageChange,
  onOpenDetail,
}: PokemonListViewProps) {
  const listErrorActionable = listError ? listErrorActionableText(listError) : null;

  return (
    <ListSectionCard
      title="Listado"
      headerAside={
        list && !showListSkeleton ? (
          <Typography
            component="p"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            Total en PokéAPI: {list.total}.
          </Typography>
        ) : undefined
      }
      error={
        listError && listErrorActionable ? (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {listErrorActionable}
          </Alert>
        ) : undefined
      }
    >
      {showListSkeleton && (
        <TableContainer sx={{ mb: 1, overflowX: 'auto' }}>
          <Table size="small" aria-busy="true" aria-label="Cargando listado">
            <TableHead>
              <TableRow>
                <TableCell scope="col" width={56}>
                  #
                </TableCell>
                <TableCell scope="col">Nombre</TableCell>
                <TableCell scope="col" align="right" width={120}>
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width={28} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="55%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="rounded" width={88} height={32} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {list && !showListSkeleton && (
        <>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" stickyHeader aria-label="Listado de Pokémon">
              <TableHead>
                <TableRow>
                  <TableCell scope="col" width={56}>
                    #
                  </TableCell>
                  <TableCell scope="col">Nombre</TableCell>
                  <TableCell scope="col" align="right" width={130}>
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.items.map((it, index) => {
                  const pid = idFromPokemonUrl(it.url);
                  return (
                    <TableRow key={it.name} hover>
                      <TableCell>{offset + index + 1}</TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {it.name}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onOpenDetail(pid)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <ListPaginationFooter
            count={list.total}
            pageSize={pageLimit}
            page={offset / pageLimit}
            onPageChange={onPageChange}
            ariaLabel="Paginación del listado Pokémon"
          />
        </>
      )}
    </ListSectionCard>
  );
}
