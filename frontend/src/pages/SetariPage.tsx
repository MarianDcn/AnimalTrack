import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Alert from '@mui/material/Alert';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  descarcaBackupAutomat,
  exportBackup,
  getBackupuriAutomate,
  restoreBackup,
} from '../api/backup';
import type { BackupAutomatInfo } from '../types/backup';

const CUVANT_CONFIRMARE = 'STERGE';

export function SetariPage() {
  const [seExportaBackup, setSeExportaBackup] = useState(false);
  const [fisierSelectat, setFisierSelectat] = useState<File | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [textConfirmare, setTextConfirmare] = useState('');
  const [seRestaureaza, setSeRestaureaza] = useState(false);
  const [eroareRestaurare, setEroareRestaurare] = useState<string | null>(null);
  const [rezultatRestaurare, setRezultatRestaurare] = useState<string | null>(null);

  const [backupuriAuto, setBackupuriAuto] = useState<BackupAutomatInfo[] | null>(null);
  const [eroareAuto, setEroareAuto] = useState<string | null>(null);

  useEffect(() => {
    getBackupuriAutomate()
      .then(setBackupuriAuto)
      .catch(() => {
        setEroareAuto('Nu am putut incarca lista de backup-uri automate.');
        setBackupuriAuto([]);
      });
  }, []);

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
