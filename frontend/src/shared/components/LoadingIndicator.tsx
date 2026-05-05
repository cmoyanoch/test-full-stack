import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
  label?: string;
  size?: number;
  sx?: SxProps<Theme>;
};

export function LoadingIndicator({ label = 'Cargando…', size, sx }: Props) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', ...sx }}
      aria-busy="true"
    >
      <CircularProgress size={size} aria-hidden />
      {label ? (
        <Typography component="span" variant="body2">
          {label}
        </Typography>
      ) : null}
    </Stack>
  );
}
