import {
  createTheme,
  type PaletteMode,
  type Theme,
} from '@mui/material/styles';

const sharedOptions = {
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    h4: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h5: {
      fontSize: '1.35rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        color: 'primary' as const,
        size: 24,
        thickness: 3.6,
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.action.hover,
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }),
        rounded: ({ theme }: { theme: Theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
  },
};

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#60a5fa' : '#2563eb',
      },
      secondary: {
        main: isDark ? '#94a3b8' : '#64748b',
      },
      error: {
        main: isDark ? '#f87171' : '#dc2626',
      },
      background: isDark
        ? {
            default: '#0f172a',
            paper: '#1e293b',
          }
        : {
            default: '#f6f7fb',
            paper: '#ffffff',
          },
    },
    ...sharedOptions,
  });
}
