import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { actualizeazaPereche, creazaPereche } from '../api/perechi';
import type { Pasare } from '../types/pasare';
import type { Pereche, PerecheFormValues } from '../types/pereche';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  masculi: Pasare[];
  femele: Pasare[];
  pereche?: Pereche | null;
}

export function PerecheFormDialog({ open, onClose, onSaved, masculi, femele, pereche }: Props) {
  const [masculId, setMasculId] = useState<string | null>(null);
  const [femelaId, setFemelaId] = useState<string | null>(null);
  const [status, setStatus] = useState<PerecheFormValues['status']>('ACTIVA');
  const [eroare, setEroare] = useState<string | null>(null);
  const [seSalveaza, setSeSalveaza] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEroare(null);
    if (pereche) {
      setMasculId(pereche.masculId);
      setFemelaId(pereche.femelaId);
      setStatus(pereche.status);
    } else {
      setMasculId(null);
      setFemelaId(null);
      setStatus('ACTIVA');
    }
  }, [open, pereche]);

  const masculSelectat = masculi.find((p) => p.id === masculId) ?? null;
  const femelaSelectata = femele.find((p) => p.id === femelaId) ?? null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!masculId || !femelaId) return;

    setEroare(null);
    setSeSalveaza(true);
    try {
      if (pereche) {
        await actualizeazaPereche(pereche.id, { masculId, femelaId, status });
      } else {
        await creazaPereche({ masculId, femelaId, status });
      }
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{pereche ? 'Editeaza perechea' : 'Pereche noua'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {eroare && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {eroare}
            </Alert>
          )}

          {(masculi.length === 0 || femele.length === 0) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {masculi.length === 0 && femele.length === 0
                ? 'Nu ai nicio pasare cu sex Mascul sau Femela setat. '
                : masculi.length === 0
                  ? 'Nu ai nicio pasare cu sex Mascul setat. '
                  : 'Nu ai nicio pasare cu sex Femela setat. '}
              Editeaza o pasare existenta (butonul creion din pagina Pasari) si seteaza sexul,
              sau adauga una noua — perechile se pot forma doar intre o pasare Mascul si una
              Femela.
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={12}>
              <Autocomplete
                options={masculi}
                getOptionLabel={(o) => `${o.nrInel}${o.nume ? ` - ${o.nume}` : ''}`}
                value={masculSelectat}
                onChange={(_e, val) => setMasculId(val?.id ?? null)}
                noOptionsText="Nu ai masculi disponibili"
                renderInput={(params) => <TextField {...params} label="Mascul" required />}
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                options={femele}
                getOptionLabel={(o) => `${o.nrInel}${o.nume ? ` - ${o.nume}` : ''}`}
                value={femelaSelectata}
                onChange={(_e, val) => setFemelaId(val?.id ?? null)}
                noOptionsText="Nu ai femele disponibile"
                renderInput={(params) => <TextField {...params} label="Femela" required />}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                label="Status"
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value as PerecheFormValues['status'])}
              >
                <MenuItem value="ACTIVA">Activa</MenuItem>
                <MenuItem value="INACTIVA">Inactiva</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Anuleaza</Button>
          <Button type="submit" variant="contained" disabled={seSalveaza || !masculId || !femelaId}>
            Salveaza
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
