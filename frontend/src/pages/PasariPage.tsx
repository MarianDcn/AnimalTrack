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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { exportPasariExcel, getPasari, stergePasare } from '../api/pasari';
import type { Pasare } from '../types/pasare';
import { PasareFormDialog } from '../components/PasareFormDialog';

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

export function PasariPage() {
  const navigate = useNavigate();
  const [pasari, setPasari] = useState<Pasare[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [pasareEditata, setPasareEditata] = useState<Pasare | null>(null);
  const [seExporta, setSeExporta] = useState(false);

  async function incarca() {
    try {
      const data = await getPasari();
      setPasari(data);
    } catch {
      setEroare('Nu am putut incarca pasarile');
    }
  }

  useEffect(() => {
    incarca();
  }, []);

  function onAdauga() {
    setPasareEditata(null);
    setDialogDeschis(true);
  }

  function onEditeaza(p: Pasare) {
    setPasareEditata(p);
    setDialogDeschis(true);
  }

  async function onSterge(p: Pasare) {
    if (!confirm(`Stergi pasarea ${p.nrInel}?`)) return;
    await stergePasare(p.id);
    incarca();
  }

  async function onExportExcel() {
    setSeExporta(true);
    try {
      await exportPasariExcel();
    } finally {
      setSeExporta(false);
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Pasari
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onExportExcel}
            disabled={seExporta}
          >
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdauga}>
            Adauga pasare
          </Button>
        </Box>
      </Box>

      {eroare && <Alert severity="error">{eroare}</Alert>}

      {!pasari ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nr. inel</TableCell>
                <TableCell>RNC</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Data eclozarii</TableCell>
                <TableCell>Mutatii</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pasari.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    {p.nrInel}
                    {p.achizitionataDinAfara && (
                      <Tooltip title="Achizitionata din afara crescatoriei (nu s-a nascut aici)">
                        <Box component="span" sx={{ color: 'warning.main', fontWeight: 700, ml: 0.5 }}>
                          *
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>{p.rnc ?? '-'}</TableCell>
                  <TableCell>{SEX_LABEL[p.sex]}</TableCell>
                  <TableCell>
                    {p.dataEclozare ? new Date(p.dataEclozare).toLocaleDateString('ro-RO') : '-'}
                  </TableCell>
                  <TableCell>{p.mutatii.length > 0 ? p.mutatii.join(', ') : '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={STATUS_LABEL[p.status] ?? p.status} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/pasari/${p.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEditeaza(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onSterge(p)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {pasari.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    Nu ai adaugat inca nicio pasare.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PasareFormDialog
        open={dialogDeschis}
        onClose={() => setDialogDeschis(false)}
        onSaved={incarca}
        pasare={pasareEditata}
        pasariExistente={pasari ?? []}
      />
    </>
  );
}
