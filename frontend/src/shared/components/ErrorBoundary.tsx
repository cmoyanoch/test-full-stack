import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            p: 4,
            maxWidth: 560,
            mx: 'auto',
            mt: 8,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" component="h1" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error.message}
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Recargar página
            </Button>
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}
