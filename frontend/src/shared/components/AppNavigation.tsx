import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../context/ColorModeContext';
import type { AppView } from '../types/app-view';

type AppNavigationProps = {
  view: AppView;
  favoritesCount: number;
  onNavigateToList: () => void;
  onNavigateToFavorites: () => void;
};

export function AppNavigation({
  view,
  favoritesCount,
  onNavigateToList,
  onNavigateToFavorites,
}: AppNavigationProps) {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const navCompact = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar
        sx={{
          gap: 1,
          flexWrap: 'wrap',
          py: navCompact ? 1 : undefined,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          Pokémon favoritos
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            size={navCompact ? 'small' : 'medium'}
            variant={view === 'list' ? 'contained' : 'outlined'}
            onClick={onNavigateToList}
          >
            Pokémon
          </Button>
          <Button
            size={navCompact ? 'small' : 'medium'}
            variant={view === 'favorites' ? 'contained' : 'outlined'}
            onClick={onNavigateToFavorites}
          >
            Favoritos ({favoritesCount})
          </Button>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            aria-label={
              mode === 'dark'
                ? 'Activar modo claro'
                : 'Activar modo oscuro'
            }
            edge="end"
            size={navCompact ? 'small' : 'medium'}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
