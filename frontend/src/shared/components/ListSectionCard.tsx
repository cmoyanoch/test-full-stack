import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type ListSectionCardProps = {
  title: string;
  headerAside?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

export function ListSectionCard({
  title,
  headerAside,
  error,
  children,
}: ListSectionCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          component="section"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
            width: '100%',
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
          {headerAside}
        </Box>
        {error}
        {children}
      </CardContent>
    </Card>
  );
}
