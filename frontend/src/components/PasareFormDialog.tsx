import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { actualizeazaPasare, creazaPasare } from '../api/pasari';
import type { Pasare, PasareFormValues } from '../types/pasare';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  pasare: Pasare | null;
  pasariExistente: Pasare[];
}

const STARE_INITIALA: PasareFormValues = {
  nrInel: '',
  rnc: '',
  dataEclozare: '',
  sex: 'NECUNOSCUT',
  mutatii: [],
  tataId: undefined,
  mamaId: undefined,
  observatii: '',
  status: 'ACTIVA',
  achizitionataDinAfara: false,
};

export function PasareFormDialog({ open, onClose, onSaved, pasare, pasariExistente }: Props) {
  const [valori, setValori] = useState<PasareFormValues>(STARE_INITIALA);
  const [eroare, setEroare] = useState<string | null>(null);
  const [seSalveaza, setSeSalveaza] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEroare(null);
    if (pasare) {
      setValori({
        nrInel: pasare.nrInel,
        rnc: pasare.rnc ?? '',
        dataEclozare: pasare.dataEclozare ? pasare.dataEclozare.slice(0, 10) : '',
        sex: pasare.sex,
        mutatii: pasare.mutatii,
        tataId: pasare.tataId ?? undefined,
        mamaId: pasare.mamaId ?? undefined,
        observatii: pasare.observatii ?? '',
        status: pasare.status,
        achizitionataDinAfara: pasare.achizitionataDinAfara,
      });
    } else {
      setValori(STARE_INITIALA);
    }
  }, [open, pasare]);

  function actualizeaza<K extends keyof PasareFormValues>(camp: K, val: PasareFormValues[K]) {
    setValori((prev) => ({ ...prev, [camp]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEroare(null);
    setSeSalveaza(true);

    const payload: PasareFormValues = {
      ...valori,
      rnc: valori.rnc || undefined,
      dataEclozare: valori.dataEclozare || undefined,
      observatii: valori.observatii || undefined,
    };

    try {
      if (pasare) {
        await actualizeazaPasare(pasare.id, payload);
      } else {
        await creazaPasare(payload);
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

  const optiuniParinti = pasariExistente.filter((p) => p.id !== pasare?.id);
  const tataSelectat = optiuniParinti.find((p) => p.id === valori.tataId) ?? null;
  const mamaSelectata = optiuniParinti.find((p) => p.id === valori.mamaId) ?? null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{pasare ? 'Editeaza pasarea' : 'Adauga pasare'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {eroare && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {eroare}
            </Alert>
          )}

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
                label="Data eclozarii"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={valori.dataEclozare}
                onChange={(e) => actualizeaza('dataEclozare', e.target.value)}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                select
                label="Sex"
                fullWidth
                value={valori.sex}
                onChange={(e) => actualizeaza('sex', e.target.value as PasareFormValues['sex'])}
              >
                <MenuItem value="MASCUL">Mascul</MenuItem>
                <MenuItem value="FEMELA">Femela</MenuItem>
                <MenuItem value="NECUNOSCUT">Necunoscut</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={valori.status}
                onChange={(e) => actualizeaza('status', e.target.value as PasareFormValues['status'])}
              >
                <MenuItem value="ACTIVA">Activa</MenuItem>
                <MenuItem value="VANDUTA">Vanduta</MenuItem>
                <MenuItem value="DONATA">Donata</MenuItem>
                <MenuItem value="DECEDATA">Decedata</MenuItem>
                <MenuItem value="TRANSFERATA">Transferata</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={valori.mutatii ?? []}
                onChange={(_e, val) => actualizeaza('mutatii', val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Culoare / Mutatie"
                    helperText="Scrie o valoare si apasa Enter; poti adauga mai multe"
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Autocomplete
                options={optiuniParinti}
                getOptionLabel={(o) => o.nrInel}
                value={tataSelectat}
                onChange={(_e, val) => actualizeaza('tataId', val?.id)}
                renderInput={(params) => <TextField {...params} label="Tata" />}
              />
            </Grid>
            <Grid size={6}>
              <Autocomplete
                options={optiuniParinti}
                getOptionLabel={(o) => o.nrInel}
                value={mamaSelectata}
                onChange={(_e, val) => actualizeaza('mamaId', val?.id)}
                renderInput={(params) => <TextField {...params} label="Mama" />}
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={valori.achizitionataDinAfara ?? false}
                    onChange={(e) => actualizeaza('achizitionataDinAfara', e.target.checked)}
                  />
                }
                label="Achizitionata din afara crescatoriei (nu s-a nascut aici)"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Rnc"
                helperText="Identificator unic de crescator (optional)"
                fullWidth
                value={valori.rnc}
                onChange={(e) => actualizeaza('rnc', e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observatii"
                fullWidth
                multiline
                minRows={2}
                value={valori.observatii}
                onChange={(e) => actualizeaza('observatii', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Anuleaza</Button>
          <Button type="submit" variant="contained" disabled={seSalveaza}>
            Salveaza
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
