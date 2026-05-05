import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useLayoutEffect, useRef, useState } from 'react';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';

type Props = {
  imageUrl: string;
  pokemonId: number;
};

type Phase = 'loading' | 'ready' | 'error';

export function PokemonDetailImage({ imageUrl, pokemonId }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const imgRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    setPhase('loading');
    const el = imgRef.current;
    const syncReady = !!(
      el &&
      el.complete &&
      el.naturalHeight > 0
    );
    if (syncReady) {
      setPhase('ready');
    }
  }, [pokemonId, imageUrl]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 150,
        height: 150,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
      }}
      aria-busy={phase === 'loading'}
    >
      {phase === 'loading' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
          }}
        >
          <CircularProgressWithLabel
            size={56}
            label="Cargando"
            aria-label="Cargando imagen del Pokémon"
          />
        </Box>
      )}
      <img
        ref={imgRef}
        key={`${pokemonId}-${imageUrl}`}
        className={`poke-thumb poke-thumb--detail ${phase === 'error' ? 'poke-thumb--hidden' : ''}`}
        src={imageUrl}
        alt=""
        loading="eager"
        decoding="async"
        onLoad={() => setPhase('ready')}
        onError={() => setPhase('error')}
      />
      {phase === 'error' && (
        <Typography
          component="p"
          variant="body2"
          role="status"
          sx={{
            m: 0,
            fontSize: '0.85rem',
            color: 'text.secondary',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          Sin imagen
        </Typography>
      )}
    </Box>
  );
}
