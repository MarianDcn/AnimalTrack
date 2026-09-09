import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { exportPasarePdf, getPasare, getPasari, getRudePasare, stergePasare } from '../api/pasari';
import type { RudePasare } from '../api/pasari';
import type { Pasare } from '../types/pasare';
import { PasareFormDialog } from '../components/PasareFormDialog';
import { ArboreGenealogicDialog } from '../components/ArboreGenealogicDialog';

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVA: 'Activa',
  VANDUTA: 'Vanduta',
  DONATA: 'Donata',
  DECEDATA: 'Decedata',
  TRANSFERATA: 'Transferata',
};

export function PasareDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pasare, setPasare] = useState<Pasare | null>(null);
  const [rude, setRude] = useState<RudePasare | null>(null);
  const [toatePasarile, setToatePasarile] = useState<Pasare[]>([]);
  const [eroare, setEroare] = useState<string | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [arboreDeschis, setArboreDeschis] = useState(false);
  const [seExporta, setSeExporta] = useState(false);
  const [eroareStergere, setEroareStergere] = useState<string | null>(null);

  async function incarca() {
    if (!id) return;
    try {
      const [pasareData, rudeData, toate] = await Promise.all([
        getPasare(id),
        getRudePasare(id),
        getPasari(),
      ]);
      setPasare(pasareData);
      setRude(rudeData);
      setToatePasarile(toate);
    } catch {
      setEroare('Nu am putut incarca pasarea');
    }
  }

  useEffect(() => {
    incarca();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onExportPdf() {
    if (!id) return;
    setSeExporta(true);
    try {
      await exportPasarePdf(id);
    } finally {
      setSeExporta(false);
    }
  }

  async function onSterge() {
    if (!pasare) return;
    if (!confirm(`Stergi pasarea ${pasare.nrInel}?`)) return;
    setEroareStergere(null);
    try {
      await stergePasare(pasare.id);
      navigate('/pasari');
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Stergerea a esuat';
      setEroareStergere(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
    }
  }

  if (eroare) return <Alert severity="error">{eroare}</Alert>;
  if (!pasare || !rude) return <Skeleton variant="rounded" height={300} />;

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pasari')} sx={{ mb: 2 }}>
        Inapoi la pasari
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' } }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {pasare.nrInel}
                {pasare.rnc ? ` - ${pasare.rnc}` : ''}
                {pasare.achizitionataDinAfara && (
                  <Tooltip title="Achizitionata din afara crescatoriei (nu s-a nascut aici)">
                    <Box component="span" sx={{ color: 'warning.main', fontWeight: 700, ml: 0.5 }}>
                      *
                    </Box>
                  </Tooltip>
                )}
              </Typography>
              <Chip size="small" sx={{ mt: 1 }} label={SEX_LABEL[pasare.sex]} />
              <Chip
                size="small"
                sx={{ mt: 1, ml: 1 }}
                label={STATUS_LABEL[pasare.status] ?? pasare.status}
                variant="outlined"
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button startIcon={<AccountTreeIcon />} onClick={() => setArboreDeschis(true)}>
                Vezi arbore genealogic
              </Button>
              <Button startIcon={<EditIcon />} onClick={() => setDialogDeschis(true)}>
                Editeaza
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={onExportPdf}
                disabled={seExporta}
              >
                Export PDF
              </Button>
              <Button color="error" startIcon={<DeleteIcon />} onClick={onSterge}>
                Sterge
              </Button>
            </Stack>
          </Stack>

          {eroareStergere && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {eroareStergere}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                Data eclozarii
              </Typography>
              <Typography variant="body2">
                {pasare.dataEclozare
                  ? new Date(pasare.dataEclozare).toLocaleDateString('ro-RO')
                  : '-'}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                Mutatii
              </Typography>
              <Typography variant="body2">
                {pasare.mutatii.length > 0 ? pasare.mutatii.join(', ') : '-'}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                Tata
              </Typography>
              <Typography variant="body2">
                {pasare.tataId ? (
                  <Link component={RouterLink} to={`/pasari/${pasare.tataId}`}>
                    Vezi tata
                  </Link>
                ) : (
                  '-'
                )}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                Mama
              </Typography>
              <Typography variant="body2">
                {pasare.mamaId ? (
                  <Link component={RouterLink} to={`/pasari/${pasare.mamaId}`}>
                    Vezi mama
                  </Link>
                ) : (
                  '-'
                )}
              </Typography>
            </Grid>
            {pasare.observatii && (
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">
                  Observatii
                </Typography>
                <Typography variant="body2">{pasare.observatii}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Frati ({rude.frati.length})
          </Typography>
          <ListaRude pasari={rude.frati} gol="Nu are frati inregistrati." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Pui ({rude.pui.length})
          </Typography>
          <ListaRude pasari={rude.pui} gol="Nu are pui inregistrati." />
        </Grid>
      </Grid>

      <PasareFormDialog
        open={dialogDeschis}
        onClose={() => setDialogDeschis(false)}
        onSaved={incarca}
        pasare={pasare}
        pasariExistente={toatePasarile}
      />

      <ArboreGenealogicDialog
        pasareId={pasare.id}
        open={arboreDeschis}
        onClose={() => setArboreDeschis(false)}
      />
    </>
  );
}

function ListaRude({ pasari, gol }: { pasari: Pasare[]; gol: string }) {
  if (pasari.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {gol}
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {pasari.map((p) => (
        <ListItemButton
          key={p.id}
          component={RouterLink}
          to={`/pasari/${p.id}`}
          sx={{ borderRadius: 1 }}
        >
          <ListItemText
            primary={`${p.nrInel}${p.rnc ? ` - ${p.rnc}` : ''}`}
            secondary={SEX_LABEL[p.sex]}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
