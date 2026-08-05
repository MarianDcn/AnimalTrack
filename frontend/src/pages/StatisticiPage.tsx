import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  getPasariPeMutatie,
  getProductieFemele,
  getProductieMasculi,
  getProductiePerechi,
  getPuiPeAn,
} from '../api/statistici';
import type {
  PasariPeMutatie,
  ProductieParinte,
  ProductiePereche,
  PuiPeAn,
} from '../types/statistici';

const CULOARE_BARA = '#2e7d32';

function GraficBare({
  titlu,
  date,
  cheieX,
  cheieY,
  gol,
  rotitEtichete,
}: {
  titlu: string;
  date: Array<Record<string, string | number>> | null;
  cheieX: string;
  cheieY: string;
  gol: string;
  rotitEtichete?: boolean;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {titlu}
        </Typography>

        {!date ? (
          <Skeleton variant="rounded" height={260} />
        ) : date.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {gol}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={date} margin={{ top: 8, right: 8, left: 0, bottom: rotitEtichete ? 32 : 8 }}>
              <CartesianGrid vertical={false} stroke="var(--mui-palette-divider, #e0e0e0)" />
              <XAxis
                dataKey={cheieX}
                tick={{ fontSize: 12 }}
                angle={rotitEtichete ? -25 : 0}
                textAnchor={rotitEtichete ? 'end' : 'middle'}
                interval={0}
                height={rotitEtichete ? 50 : 30}
                axisLine={{ stroke: '#bdbdbd' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                formatter={(value) => [value, 'Total']}
              />
              <Bar dataKey={cheieY} fill={CULOARE_BARA} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function StatisticiPage() {
  const [mutatii, setMutatii] = useState<PasariPeMutatie[] | null>(null);
  const [puiAn, setPuiAn] = useState<PuiPeAn[] | null>(null);
  const [perechi, setPerechi] = useState<ProductiePereche[] | null>(null);
  const [masculi, setMasculi] = useState<ProductieParinte[] | null>(null);
  const [femele, setFemele] = useState<ProductieParinte[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [anSelectat, setAnSelectat] = useState<number | ''>('');

  useEffect(() => {
    Promise.all([getPasariPeMutatie(), getPuiPeAn()])
      .then(([m, p]) => {
        setMutatii(m);
        setPuiAn(p);
      })
      .catch(() => setEroare('Nu am putut incarca statisticile'));
  }, []);

  useEffect(() => {
    const an = anSelectat || undefined;
    setPerechi(null);
    setMasculi(null);
    setFemele(null);
    Promise.all([getProductiePerechi(an), getProductieMasculi(an), getProductieFemele(an)])
      .then(([pe, ma, fe]) => {
        setPerechi(pe);
        setMasculi(ma);
        setFemele(fe);
      })
      .catch(() => setEroare('Nu am putut incarca statisticile de productie'));
  }, [anSelectat]);

  const aniDisponibili = useMemo(() => puiAn?.map((p) => p.an) ?? [], [puiAn]);

  const dateMutatii = mutatii?.map((m) => ({ mutatie: m.mutatie, total: m.total })) ?? null;
  const datePuiAn = puiAn?.map((p) => ({ an: String(p.an), total: p.total })) ?? null;
  const datePerechi =
    perechi?.map((p) => ({ pereche: `${p.mascul} x ${p.femela}`, total: p.total })) ?? null;
  const dateMasculi = masculi?.map((m) => ({ nrInel: m.nrInel, total: m.total })) ?? null;
  const dateFemele = femele?.map((f) => ({ nrInel: f.nrInel, total: f.total })) ?? null;

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Statistici
      </Typography>

      {eroare && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {eroare}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="An (productie)"
          value={anSelectat}
          onChange={(e) => setAnSelectat(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Toti anii</MenuItem>
          {aniDisponibili.map((an) => (
            <MenuItem key={an} value={an}>
              {an}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GraficBare
            titlu="Pasari pe mutatie"
            date={dateMutatii}
            cheieX="mutatie"
            cheieY="total"
            gol="Nicio pasare inregistrata inca."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GraficBare
            titlu="Pui eclozati pe an"
            date={datePuiAn}
            cheieX="an"
            cheieY="total"
            gol="Nicio data de eclozare inregistrata inca."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GraficBare
            titlu="Productie per pereche (nr. pui)"
            date={datePerechi}
            cheieX="pereche"
            cheieY="total"
            gol="Nicio pereche inregistrata inca."
            rotitEtichete
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <GraficBare
            titlu="Productie per mascul"
            date={dateMasculi}
            cheieX="nrInel"
            cheieY="total"
            gol="Niciun mascul cu pui inregistrati."
            rotitEtichete
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <GraficBare
            titlu="Productie per femela"
            date={dateFemele}
            cheieX="nrInel"
            cheieY="total"
            gol="Nicio femela cu pui inregistrati."
            rotitEtichete
          />
        </Grid>
      </Grid>
    </>
  );
}
