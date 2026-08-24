import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EggIcon from '@mui/icons-material/Egg';
import { adaugaOu, actualizeazaStatusOu, creazaSerie, eclozeazaOu } from '../api/cuibarit';
import { getPereche, getSeriiPereche } from '../api/perechi';
import type { SexPasare } from '../types/pasare';
import type { Pereche } from '../types/pereche';
import type { EclozeazaValues, Ou, SerieCuibarit, StatusOu } from '../types/cuibarit';

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

const STATUS_OU_LABEL: Record<StatusOu, string> = {
  DEPUS: 'Depus',
  FECUNDAT: 'Fecundat',
  NEFECUNDAT: 'Nefecundat',
  ECLOZAT: 'Eclozat',
  PIERDUT: 'Pierdut',
};

const STATUS_OU_CULOARE: Record<StatusOu, 'default' | 'success' | 'error' | 'warning'> = {
  DEPUS: 'default',
  FECUNDAT: 'success',
  NEFECUNDAT: 'error',
  ECLOZAT: 'success',
  PIERDUT: 'error',
};

export function PerecheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pereche, setPereche] = useState<Pereche | null>(null);
  const [serii, setSerii] = useState<SerieCuibarit[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [dialogSerieDeschis, setDialogSerieDeschis] = useState(false);
  const [ouEclozare, setOuEclozare] = useState<Ou | null>(null);

  async function incarca() {
    if (!id) return;
    try {
      const [perecheData, seriiData] = await Promise.all([getPereche(id), getSeriiPereche(id)]);
      setPereche(perecheData);
      setSerii(seriiData);
    } catch {
      setEroare('Nu am putut incarca perechea');
    }
  }

  useEffect(() => {
    incarca();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onAdaugaOu(serieId: string) {
    await adaugaOu(serieId, {});
    incarca();
  }

  async function onSchimbaStatus(ouId: string, status: StatusOu) {
    await actualizeazaStatusOu(ouId, status);
    incarca();
  }

  if (eroare) return <Alert severity="error">{eroare}</Alert>;
  if (!pereche || !serii) return <Skeleton variant="rounded" height={300} />;

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/perechi')} sx={{ mb: 2 }}>
        Inapoi la perechi
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                <Link component={RouterLink} to={`/pasari/${pereche.mascul.id}`} underline="hover">
                  {pereche.mascul.nrInel}
                </Link>
                {' × '}
                <Link component={RouterLink} to={`/pasari/${pereche.femela.id}`} underline="hover">
                  {pereche.femela.nrInel}
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mascul: {pereche.mascul.nrInel}
                {pereche.mascul.nume ? ` (${pereche.mascul.nume})` : ''} · Femela:{' '}
                {pereche.femela.nrInel}
                {pereche.femela.nume ? ` (${pereche.femela.nume})` : ''}
              </Typography>
            </Box>
            <Chip
              label={pereche.status === 'ACTIVA' ? 'Activa' : 'Inactiva'}
              color={pereche.status === 'ACTIVA' ? 'success' : 'default'}
            />
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Serii de cuibarit</Typography>
        <Button variant="contained" size="small" onClick={() => setDialogSerieDeschis(true)}>
          Serie noua
        </Button>
      </Box>

      <Stack spacing={2}>
        {serii.map((serie, index) => (
          <Card key={serie.id} variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
              >
                <Typography variant="subtitle1">
                  Seria {index + 1} — Imperechere:{' '}
                  {serie.dataImperechere
                    ? new Date(serie.dataImperechere).toLocaleDateString('ro-RO')
                    : '-'}
                  {serie.dataPrimOu &&
                    ` · Primul ou: ${new Date(serie.dataPrimOu).toLocaleDateString('ro-RO')}`}
                </Typography>
                <Button size="small" startIcon={<EggIcon />} onClick={() => onAdaugaOu(serie.id)}>
                  Adauga ou
                </Button>
              </Stack>
              <Divider sx={{ mb: 1 }} />

              {serie.oua.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Niciun ou adaugat inca.
                </Typography>
              )}

              <Stack spacing={1}>
                {serie.oua.map((ou) => (
                  <Stack
                    key={ou.id}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center', py: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 110 }}>
                      {new Date(ou.dataDepunere).toLocaleDateString('ro-RO')}
                    </Typography>
                    <Chip
                      size="small"
                      label={STATUS_OU_LABEL[ou.status]}
                      color={STATUS_OU_CULOARE[ou.status]}
                    />
                    <TextField
                      select
                      size="small"
                      value={ou.status}
                      onChange={(e) => onSchimbaStatus(ou.id, e.target.value as StatusOu)}
                      sx={{ width: 160 }}
                    >
                      {Object.entries(STATUS_OU_LABEL).map(([valoare, label]) => (
                        <MenuItem key={valoare} value={valoare}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {ou.pasareId && ou.pasare ? (
                      <Link
                        component={RouterLink}
                        to={`/pasari/${ou.pasare.id}`}
                        variant="body2"
                        underline="hover"
                      >
                        {ou.pasare.nrInel}
                        {' · '}
                        {SEX_LABEL[ou.pasare.sex]}
                        {ou.pasare.culoare ? ` · ${ou.pasare.culoare}` : ''}
                        {ou.pasare.mutatie ? ` · ${ou.pasare.mutatie}` : ''}
                      </Link>
                    ) : (
                      <Button size="small" onClick={() => setOuEclozare(ou)}>
                        Marcheaza eclozat → creeaza pasare
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}

        {serii.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nicio serie de cuibarit inca pentru aceasta pereche.
          </Typography>
        )}
      </Stack>

      <SerieNouaDialog
        open={dialogSerieDeschis}
        perecheId={pereche.id}
        onClose={() => setDialogSerieDeschis(false)}
        onSaved={incarca}
      />

      <EclozeazaDialog ou={ouEclozare} onClose={() => setOuEclozare(null)} onSaved={incarca} />
    </>
  );
}

function SerieNouaDialog({
  open,
  perecheId,
  onClose,
  onSaved,
}: {
  open: boolean;
  perecheId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dataImperechere, setDataImperechere] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDataImperechere(new Date().toISOString().slice(0, 10));
      setEroare(null);
    }
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEroare(null);
    try {
      await creazaSerie({ perecheId, dataImperechere: dataImperechere || undefined });
      onSaved();
      onClose();
    } catch {
      setEroare('Salvarea a esuat');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Serie de cuibarit noua</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {eroare && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {eroare}
            </Alert>
          )}
          <TextField
            label="Data imperecherii"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={dataImperechere}
            onChange={(e) => setDataImperechere(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Anuleaza</Button>
          <Button type="submit" variant="contained">
            Salveaza
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const STARE_INITIALA_ECLOZARE: EclozeazaValues = { nrInel: '' };

function EclozeazaDialog({
  ou,
  onClose,
  onSaved,
}: {
  ou: Ou | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [valori, setValori] = useState<EclozeazaValues>(STARE_INITIALA_ECLOZARE);
  const [eroare, setEroare] = useState<string | null>(null);
  const [seSalveaza, setSeSalveaza] = useState(false);

  useEffect(() => {
    if (ou) {
      setValori(STARE_INITIALA_ECLOZARE);
      setEroare(null);
    }
  }, [ou]);

  function actualizeaza<K extends keyof EclozeazaValues>(camp: K, val: EclozeazaValues[K]) {
    setValori((prev) => ({ ...prev, [camp]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ou) return;
    setEroare(null);
    setSeSalveaza(true);
    try {
      await eclozeazaOu(ou.id, {
        ...valori,
        nume: valori.nume || undefined,
        dataEclozare: valori.dataEclozare || undefined,
        mutatie: valori.mutatie || undefined,
        culoare: valori.culoare || undefined,
        observatii: valori.observatii || undefined,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Salvarea a esuat';
      setEroare(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
    } finally {
      setSeSalveaza(false);
    }
  }

  return (
    <Dialog open={!!ou} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ou eclozat — creeaza pasarea</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {eroare && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {eroare}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se completeaza automat tata/mama din aceasta pereche.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label="Nr. inel"
                fullWidth
                required
                value={valori.nrInel}
                onChange={(e) => actualizeaza('nrInel', e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="Nume (optional)"
                fullWidth
                value={valori.nume ?? ''}
                onChange={(e) => actualizeaza('nume', e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="Data eclozarii"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={valori.dataEclozare ?? ''}
                onChange={(e) => actualizeaza('dataEclozare', e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                select
                label="Sex"
                fullWidth
                value={valori.sex ?? 'NECUNOSCUT'}
                onChange={(e) => actualizeaza('sex', e.target.value as SexPasare)}
              >
                <MenuItem value="MASCUL">Mascul</MenuItem>
                <MenuItem value="FEMELA">Femela</MenuItem>
                <MenuItem value="NECUNOSCUT">Necunoscut</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField
                label="Mutatie"
                fullWidth
                value={valori.mutatie ?? ''}
                onChange={(e) => actualizeaza('mutatie', e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="Culoare"
                fullWidth
                value={valori.culoare ?? ''}
                onChange={(e) => actualizeaza('culoare', e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Observatii"
                fullWidth
                multiline
                minRows={2}
                value={valori.observatii ?? ''}
                onChange={(e) => actualizeaza('observatii', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Anuleaza</Button>
          <Button type="submit" variant="contained" disabled={seSalveaza || !valori.nrInel}>
            Salveaza
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
