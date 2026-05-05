import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ToastItem } from '../hooks/useToasts';

type ToastStackProps = {
  toasts: ToastItem[];
};

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: (t) => t.zIndex.snackbar,
        maxWidth: 360,
      }}
      aria-live="polite"
    >
      <Stack spacing={1}>
        {toasts.map((t) => (
          <Alert key={t.id} severity={t.severity} variant="filled">
            {t.message}
          </Alert>
        ))}
      </Stack>
    </Box>
  );
}
