import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

export function ListCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="rounded" height={36} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
