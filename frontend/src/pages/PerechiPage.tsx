import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getPasari } from '../api/pasari';
import { getPerechi, stergePereche } from '../api/perechi';
import type { Pasare } from '../types/pasare';
import type { Pereche } from '../types/pereche';
import { PerecheFormDialog } from '../components/PerecheFormDialog';

export function PerechiPage() {
  const navigate = useNavigate();
  const [perechi, setPerechi] = useState<Pereche[] | null>(null);
  const [pasari, setPasari] = useState<Pasare[]>([]);
  const [eroare, setEroare] = useState<string | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [perecheEditata, setPerecheEditata] = useState<Pereche | null>(null);

  async function incarca() {
    try {
      const [listaPerechi, listaPasari] = await Promise.all([getPerechi(), getPasari()]);
      setPerechi(listaPerechi);
      setPasari(listaPasari);
    } catch {
      setEroare('Nu am putut incarca perechile');
    }
  }

  useEffect(() => {
    incarca();
  }, []);

  const masculi = pasari.filter((p) => p.sex === 'MASCUL');
  const femele = pasari.filter((p) => p.sex === 'FEMELA');

  function onAdauga() {
    setPerecheEditata(null);
    setDialogDeschis(true);
  }

  function onEditeaza(p: Pereche) {
    setPerecheEditata(p);
    setDialogDeschis(true);
  }

  async function onSterge(p: Pereche) {
    const confirmat = confirm(
      `Stergi perechea ${p.mascul.nrInel} × ${p.femela.nrInel}? Se sterg si toate seriile de cuibarit si ouale asociate.`,
    );
    if (!confirmat) return;
    await stergePereche(p.id);
    incarca();
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Perechi
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdauga}>
          Pereche noua
        </Button>
      </Box>

      {eroare && <Alert severity="error">{eroare}</Alert>}

      {!perechi ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mascul</TableCell>
                <TableCell>Femela</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Creata la</TableCell>
                <TableCell align="right">Actiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perechi.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/perechi/${p.id}`)}
                >
                  <TableCell>
                    {p.mascul.nrInel}
                    {p.mascul.nume ? ` - ${p.mascul.nume}` : ''}
                  </TableCell>
                  <TableCell>
                    {p.femela.nrInel}
                    {p.femela.nume ? ` - ${p.femela.nume}` : ''}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.status === 'ACTIVA' ? 'Activa' : 'Inactiva'}
                      color={p.status === 'ACTIVA' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{new Date(p.dataCreare).toLocaleDateString('ro-RO')}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => onEditeaza(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onSterge(p)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {perechi.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    Nu ai adaugat inca nicio pereche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PerecheFormDialog
        open={dialogDeschis}
        onClose={() => setDialogDeschis(false)}
        onSaved={incarca}
        pereche={perecheEditata}
        masculi={masculi}
        femele={femele}
      />
    </>
  );
}
