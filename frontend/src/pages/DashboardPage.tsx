import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { getPasari } from '../api/pasari';
import type { Pasare } from '../types/pasare';

function StatCard({ titlu, valoare }: { titlu: string; valoare: number }) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
      <Typography variant="h3" sx={{ fontWeight: 700 }} color="primary.main">
        {valoare}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {titlu}
      </Typography>
    </Paper>
  );
}

export function DashboardPage() {
  const [pasari, setPasari] = useState<Pasare[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);

  useEffect(() => {
    getPasari()
      .then(setPasari)
      .catch(() => setEroare('Nu am putut incarca datele'));
  }, []);

  const statistici = useMemo(() => {
    if (!pasari) return null;
    return {
      total: pasari.length,
      masculi: pasari.filter((p) => p.sex === 'MASCUL').length,
      femele: pasari.filter((p) => p.sex === 'FEMELA').length,
    };
  }, [pasari]);

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        Dashboard
      </Typography>

      {eroare && <Alert severity="error">{eroare}</Alert>}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          {statistici ? (
            <StatCard titlu="Total pasari" valoare={statistici.total} />
          ) : (
            <Skeleton variant="rounded" height={110} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {statistici ? (
            <StatCard titlu="Masculi" valoare={statistici.masculi} />
          ) : (
            <Skeleton variant="rounded" height={110} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {statistici ? (
            <StatCard titlu="Femele" valoare={statistici.femele} />
          ) : (
            <Skeleton variant="rounded" height={110} />
          )}
        </Grid>
      </Grid>
    </>
  );
}
