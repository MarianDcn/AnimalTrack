import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  descarcaBackupAutomat,
  exportBackup,
  getBackupuriAutomate,
  restoreBackup,
} from '../api/backup';
import { trimiteSugestie } from '../api/sugestii';
import { actualizeazaFerma } from '../api/ferma';
import type { BackupAutomatInfo } from '../types/backup';
import { useAuth } from '../auth/AuthContext';
import {
  CULORI_PRESTABILITE,
  PREFERINTE_IMPLICITE,
  usePreferinte,
} from '../preferinte/PreferinteContext';
import type {
  DensitateTabel,
  MarimeText,
  PaginaImplicita,
  TemaMod,
} from '../preferinte/PreferinteContext';

const CUVANT_CONFIRMARE = 'STERGE';

const PAGINI_IMPLICITE: { valoare: PaginaImplicita; label: string }[] = [
  { valoare: '/', label: 'Dashboard' },
  { valoare: '/pasari', label: 'Pasari' },
  { valoare: '/perechi', label: 'Perechi' },
  { valoare: '/statistici', label: 'Statistici' },
];

export function SetariPage() {
  const { user, actualizeazaFermaNume } = useAuth();
  const { preferinte, actualizeazaPreferinte, reseteazaPreferinte } = usePreferinte();
  const [numeFerma, setNumeFerma] = useState(user?.fermaNume ?? '');
  const [seSalveazaNume, setSeSalveazaNume] = useState(false);
  const [eroareNume, setEroareNume] = useState<string | null>(null);
  const [numeSalvat, setNumeSalvat] = useState(false);
  const [seExportaBackup, setSeExportaBackup] = useState(false);
  const [fisierSelectat, setFisierSelectat] = useState<File | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [textConfirmare, setTextConfirmare] = useState('');
  const [seRestaureaza, setSeRestaureaza] = useState(false);
  const [eroareRestaurare, setEroareRestaurare] = useState<string | null>(null);
  const [rezultatRestaurare, setRezultatRestaurare] = useState<string | null>(null);

  const [backupuriAuto, setBackupuriAuto] = useState<BackupAutomatInfo[] | null>(null);
  const [eroareAuto, setEroareAuto] = useState<string | null>(null);

  const [mesajSugestie, setMesajSugestie] = useState('');
  const [seTrimiteSugestie, setSeTrimiteSugestie] = useState(false);
  const [eroareSugestie, setEroareSugestie] = useState<string | null>(null);
  const [sugestieTrimisa, setSugestieTrimisa] = useState(false);

  useEffect(() => {
    getBackupuriAutomate()
      .then(setBackupuriAuto)
      .catch(() => {
        setEroareAuto('Nu am putut incarca lista de backup-uri automate.');
        setBackupuriAuto([]);
      });
  }, []);

  async function onSalveazaNumeFerma() {
    const numeCurat = numeFerma.trim();
    if (!numeCurat) return;
    setSeSalveazaNume(true);
    setEroareNume(null);
    setNumeSalvat(false);
    try {
      const rezultat = await actualizeazaFerma(numeCurat);
      actualizeazaFermaNume(rezultat.nume);
      setNumeSalvat(true);
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Salvarea a esuat';
      setEroareNume(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
    } finally {
      setSeSalveazaNume(false);
    }
  }

  async function onDescarcaBackup() {
    setSeExportaBackup(true);
    try {
      await exportBackup();
    } finally {
      setSeExportaBackup(false);
    }
  }

  function onFisierSelectat(e: ChangeEvent<HTMLInputElement>) {
    const fisier = e.target.files?.[0];
    e.target.value = '';
    if (!fisier) return;
    setFisierSelectat(fisier);
    setRezultatRestaurare(null);
    setDialogDeschis(true);
  }

  function onInchideDialog() {
    setDialogDeschis(false);
    setTextConfirmare('');
    setEroareRestaurare(null);
  }

  async function onTrimiteSugestie() {
    if (!mesajSugestie.trim()) return;
    setSeTrimiteSugestie(true);
    setEroareSugestie(null);
    try {
      await trimiteSugestie({ mesaj: mesajSugestie.trim() });
      setMesajSugestie('');
      setSugestieTrimisa(true);
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Trimiterea a esuat';
      setEroareSugestie(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
    } finally {
      setSeTrimiteSugestie(false);
    }
  }

  async function onConfirmaRestaurare() {
    if (!fisierSelectat) return;
    setSeRestaureaza(true);
    setEroareRestaurare(null);
    try {
      const rezultat = await restoreBackup(fisierSelectat);
      setRezultatRestaurare(
        `Restaurat: ${rezultat.restaurat.pasari} pasari, ${rezultat.restaurat.perechi} perechi, ${rezultat.restaurat.serii} serii, ${rezultat.restaurat.oua} oua.`,
      );
      onInchideDialog();
      setFisierSelectat(null);
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Restaurarea a esuat';
      setEroareRestaurare(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
    } finally {
      setSeRestaureaza(false);
    }
  }

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Setari
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Numele crescatoriei
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Acest nume apare in antetul aplicatiei, in locul unde initial scria „AnimalTrack”.
            </Typography>

            {numeSalvat && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNumeSalvat(false)}>
                Numele a fost actualizat.
              </Alert>
            )}
            {eroareNume && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {eroareNume}
              </Alert>
            )}

            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
              <TextField
                size="small"
                value={numeFerma}
                onChange={(e) => setNumeFerma(e.target.value)}
                sx={{ minWidth: 240, flex: { xs: 1, sm: 'initial' } }}
              />
              <Button
                variant="contained"
                onClick={onSalveazaNumeFerma}
                disabled={
                  seSalveazaNume ||
                  !numeFerma.trim() ||
                  numeFerma.trim() === user?.fermaNume
                }
              >
                Salveaza
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Aspect</Typography>
              <Button
                size="small"
                onClick={reseteazaPreferinte}
                disabled={
                  preferinte.tema === PREFERINTE_IMPLICITE.tema &&
                  preferinte.culoarePrincipala === PREFERINTE_IMPLICITE.culoarePrincipala &&
                  preferinte.densitateTabele === PREFERINTE_IMPLICITE.densitateTabele &&
                  preferinte.marimeText === PREFERINTE_IMPLICITE.marimeText &&
                  preferinte.paginaImplicita === PREFERINTE_IMPLICITE.paginaImplicita
                }
              >
                Reseteaza la implicit
              </Button>
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tema
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={preferinte.tema}
              onChange={(_e, v: TemaMod | null) => v && actualizeazaPreferinte({ tema: v })}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="deschis">Deschis</ToggleButton>
              <ToggleButton value="intunecat">Intunecat</ToggleButton>
              <ToggleButton value="automat">Automat</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Culoare principala
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3, flexWrap: 'wrap', rowGap: 1 }}>
              {CULORI_PRESTABILITE.map((c) => (
                <Tooltip key={c.valoare} title={c.nume}>
                  <Box
                    onClick={() => actualizeazaPreferinte({ culoarePrincipala: c.valoare })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: c.valoare,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor:
                        preferinte.culoarePrincipala.toLowerCase() === c.valoare.toLowerCase()
                          ? 'text.primary'
                          : 'transparent',
                    }}
                  >
                    {preferinte.culoarePrincipala.toLowerCase() === c.valoare.toLowerCase() && (
                      <CheckIcon sx={{ color: '#fff', fontSize: 18 }} />
                    )}
                  </Box>
                </Tooltip>
              ))}
              <Tooltip title="Culoare personalizata">
                <Box
                  component="label"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    type="color"
                    value={preferinte.culoarePrincipala}
                    onChange={(e) => actualizeazaPreferinte({ culoarePrincipala: e.target.value })}
                    style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                </Box>
              </Tooltip>
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Densitate tabele
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={preferinte.densitateTabele}
              onChange={(_e, v: DensitateTabel | null) => v && actualizeazaPreferinte({ densitateTabele: v })}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="compacta">Compacta</ToggleButton>
              <ToggleButton value="confortabila">Confortabila</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Marime text
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={preferinte.marimeText}
              onChange={(_e, v: MarimeText | null) => v && actualizeazaPreferinte({ marimeText: v })}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="normal">Normal</ToggleButton>
              <ToggleButton value="mare">Mare</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pagina afisata dupa autentificare
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={preferinte.paginaImplicita}
              onChange={(_e, v: PaginaImplicita | null) => v && actualizeazaPreferinte({ paginaImplicita: v })}
            >
              {PAGINI_IMPLICITE.map((p) => (
                <ToggleButton key={p.valoare} value={p.valoare}>
                  {p.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Backup manual
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Descarca un fisier JSON cu toate pasarile, perechile, seriile de cuibarit si ouale
              din ferma ta. Pastreaza-l intr-un loc sigur.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onDescarcaBackup}
              disabled={seExportaBackup}
            >
              Descarca backup
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Restaurare din backup
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Atentie: restaurarea <strong>inlocuieste complet</strong> toate pasarile, perechile,
              seriile si ouale actuale din ferma ta cu cele din fisierul de backup. Orice ai
              adaugat dupa data backup-ului se pierde. Foloseste doar daca ai sters din greseala
              date si vrei sa revii la o stare anterioara salvata.
            </Alert>

            {rezultatRestaurare && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {rezultatRestaurare}
              </Alert>
            )}

            <Button component="label" variant="outlined" startIcon={<FileUploadIcon />}>
              Alege fisier de backup (.json)
              <input type="file" hidden accept="application/json" onChange={onFisierSelectat} />
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Backup-uri automate saptamanale
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              In fiecare saptamana se salveaza automat un backup, pastrat separat de aplicatie.
              Le poti descarca oricand de aici.
            </Typography>

            {eroareAuto && <Alert severity="error">{eroareAuto}</Alert>}

            {!backupuriAuto ? (
              <Skeleton variant="rounded" height={80} />
            ) : eroareAuto ? null : backupuriAuto.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Niciun backup automat inca (primul se creeaza la urmatoarea rulare saptamanala).
              </Typography>
            ) : (
              <List dense>
                {backupuriAuto.map((b) => (
                  <ListItem
                    key={b.fisier}
                    secondaryAction={
                      <Tooltip title="Descarca">
                        <IconButton onClick={() => descarcaBackupAutomat(b.fisier)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={new Date(b.dataCreare).toLocaleString('ro-RO')}
                      secondary={`${(b.marime / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Sugestii pentru dezvoltare
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ai o idee de imbunatatire sau ai observat ceva ce nu functioneaza cum trebuie? Scrie
              mai jos, mesajul ajunge direct la dezvoltator.
            </Typography>

            {sugestieTrimisa && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSugestieTrimisa(false)}>
                Multumim! Sugestia ta a fost trimisa.
              </Alert>
            )}
            {eroareSugestie && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {eroareSugestie}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Scrie aici sugestia sau problema intalnita..."
              value={mesajSugestie}
              onChange={(e) => setMesajSugestie(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={onTrimiteSugestie}
              disabled={seTrimiteSugestie || mesajSugestie.trim().length < 3}
            >
              Trimite sugestia
            </Button>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={dialogDeschis} onClose={onInchideDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirma restaurarea</DialogTitle>
        <DialogContent>
          {eroareRestaurare && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {eroareRestaurare}
            </Alert>
          )}
          <Alert severity="error" sx={{ mb: 2 }}>
            Fisier: <strong>{fisierSelectat?.name}</strong>. Toate datele actuale din ferma ta vor
            fi sterse si inlocuite cu cele din acest fisier. Aceasta actiune nu poate fi anulata.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Scrie <strong>{CUVANT_CONFIRMARE}</strong> mai jos pentru a confirma:
          </Typography>
          <TextField
            fullWidth
            autoFocus
            value={textConfirmare}
            onChange={(e) => setTextConfirmare(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onInchideDialog}>Anuleaza</Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<RestoreIcon />}
            disabled={textConfirmare !== CUVANT_CONFIRMARE || seRestaureaza}
            onClick={onConfirmaRestaurare}
          >
            Restaureaza
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
