import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createAppTheme } from '../../theme';

const STORAGE_KEY_V1 = 'pokemon-app-color-mode:v1';
const STORAGE_KEY_LEGACY = 'pokemon-app-color-mode';

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
);

function readInitialMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacy === 'dark' || legacy === 'light') {
      if (!localStorage.getItem(STORAGE_KEY_V1)) {
        localStorage.setItem(STORAGE_KEY_V1, legacy);
      }
      localStorage.removeItem(STORAGE_KEY_LEGACY);
    }
    const stored = localStorage.getItem(STORAGE_KEY_V1);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(readInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V1, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ mode, toggleColorMode }),
    [mode, toggleColorMode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return ctx;
}
