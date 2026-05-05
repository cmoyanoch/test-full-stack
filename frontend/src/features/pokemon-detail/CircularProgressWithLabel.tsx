import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
  /** Tamaño del anillo en px (por defecto 56). */
  size?: number;
  /** Texto bajo el indicador (válido con carga indeterminada). */
  label?: string;
  /** Accesible para lectores de pantalla (usa aria-labelledby si hay label visible). */
  'aria-label'?: string;
  sx?: SxProps<Theme>;
};

/**
 * Patrón tipo “Circular with label” de MUI: anillo + etiqueta centrados.
 * Por defecto indeterminado (sin porcentaje real desde `<img>`).
 */
export function CircularProgressWithLabel({
  size = 56,
  label = 'Cargando',
  'aria-label': ariaLabel = 'Cargando imagen',
  sx,
}: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size={size}
          thickness={4}
          aria-label={ariaLabel}
          variant="indeterminate"
        />
      </Box>
      {label ? (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.2, textAlign: 'center', maxWidth: size + 40 }}
        >
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}
