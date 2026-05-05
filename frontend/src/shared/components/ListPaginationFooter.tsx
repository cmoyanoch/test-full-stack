import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

export type ListPaginationFooterProps = {
  /** Total items across all pages */
  count: number;
  pageSize: number;
  /** Current page index (0-based); matches TablePagination / parent offset math */
  page: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
  /** If true, render nothing when all items fit on one page or count is 0 */
  hideWhenSinglePage?: boolean;
};

function paginationAriaLabel(
  type: string,
  pageNumber: number,
  selected: boolean,
): string {
  if (type === 'page') {
    return selected ? `Página ${pageNumber}, actual` : `Ir a la página ${pageNumber}`;
  }
  if (type === 'next') return 'Página siguiente';
  if (type === 'previous') return 'Página anterior';
  if (type === 'first') return 'Primera página';
  if (type === 'last') return 'Última página';
  if (type === 'start-ellipsis' || type === 'end-ellipsis') {
    return 'Más páginas';
  }
  return '';
}

export function ListPaginationFooter({
  count,
  pageSize,
  page,
  onPageChange,
  ariaLabel,
  hideWhenSinglePage = true,
}: ListPaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (hideWhenSinglePage && (count === 0 || count <= pageSize)) {
    return null;
  }

  const from = count === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, count);
  const rangeLabel =
    count === 0
      ? 'Mostrando 0–0 de 0'
      : `Mostrando ${from}–${to} de ${count}`;

  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const muiPage = safePage + 1;

  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        mt: 2,
        width: '100%',
        borderTop: 1,
        borderColor: 'divider',
        pt: 2,
        px: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {rangeLabel}
      </Typography>
      <Pagination
        count={totalPages}
        page={muiPage}
        onChange={(_, value) => onPageChange(value - 1)}
        color="primary"
        getItemAriaLabel={(type, pageNumber, selected) =>
          paginationAriaLabel(type, pageNumber, selected)
        }
      />
    </Box>
  );
}
