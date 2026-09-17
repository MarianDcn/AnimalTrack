import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { exportPasariExcel, getPasari, stergePasare } from '../api/pasari';
import type { Pasare, SexPasare, StatusPasare } from '../types/pasare';
import { PasareFormDialog } from '../components/PasareFormDialog';

const SEX_LABEL: Record<SexPasare, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

const STATUS_LABEL: Record<StatusPasare, string> = {
  ACTIVA: 'Activa',
  VANDUTA: 'Vanduta',
  DONATA: 'Donata',
  DECEDATA: 'Decedata',
  TRANSFERATA: 'Transferata',
};

const TOATE_STATUSURILE = Object.keys(STATUS_LABEL) as StatusPasare[];
const TOATE_SEXELE = Object.keys(SEX_LABEL) as SexPasare[];

type CampSortare = 'nrInel' | 'dataEclozare' | null;

interface FiltrePersistate {
  statusuri: StatusPasare[];
  sexe: SexPasare[];
  mutatii: string[];
  an: number | 'toate';
  campSortare: CampSortare;
  directieSortare: 'asc' | 'desc';
}

const CHEIE_FILTRE = 'animaltrack.pasariFiltre';

function incarcaFiltre(): Partial<FiltrePersistate> {
  try {
    const bruta = localStorage.getItem(CHEIE_FILTRE);
    return bruta ? (JSON.parse(bruta) as Partial<FiltrePersistate>) : {};
  } catch {
    return {};
  }
}

const filtreInitiale = incarcaFiltre();

export function PasariPage() {
  const navigate = useNavigate();
  const [pasari, setPasari] = useState<Pasare[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [dialogDeschis, setDialogDeschis] = useState(false);
  const [pasareEditata, setPasareEditata] = useState<Pasare | null>(null);
  const [seExporta, setSeExporta] = useState(false);

  const [campSortare, setCampSortare] = useState<CampSortare>(
    filtreInitiale.campSortare ?? null,
  );
  const [directieSortare, setDirectieSortare] = useState<'asc' | 'desc'>(
    filtreInitiale.directieSortare ?? 'asc',
  );

  const [anFiltrat, setAnFiltrat] = useState<number | 'toate'>(filtreInitiale.an ?? 'toate');
  const [mutatiiFiltrate, setMutatiiFiltrate] = useState<Set<string>>(
    new Set(filtreInitiale.mutatii ?? []),
  );
  const [statusuriFiltrate, setStatusuriFiltrate] = useState<Set<StatusPasare>>(
    new Set(filtreInitiale.statusuri ?? ['ACTIVA']),
  );
  const [sexeFiltrate, setSexeFiltrate] = useState<Set<SexPasare>>(
    new Set(filtreInitiale.sexe ?? TOATE_SEXELE),
  );

  const [anchorAn, setAnchorAn] = useState<HTMLElement | null>(null);
  const [anchorMutatii, setAnchorMutatii] = useState<HTMLElement | null>(null);
  const [anchorStatus, setAnchorStatus] = useState<HTMLElement | null>(null);
  const [anchorSex, setAnchorSex] = useState<HTMLElement | null>(null);

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

  useEffect(() => {
    try {
      const filtre: FiltrePersistate = {
        statusuri: [...statusuriFiltrate],
        sexe: [...sexeFiltrate],
        mutatii: [...mutatiiFiltrate],
        an: anFiltrat,
        campSortare,
        directieSortare,
      };
      localStorage.setItem(CHEIE_FILTRE, JSON.stringify(filtre));
    } catch {
      // localStorage indisponibil - filtrele nu se salveaza intre sesiuni
    }
  }, [statusuriFiltrate, sexeFiltrate, mutatiiFiltrate, anFiltrat, campSortare, directieSortare]);

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

  function onSorteazaDupa(camp: 'nrInel' | 'dataEclozare') {
    if (campSortare === camp) {
      setDirectieSortare((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setCampSortare(camp);
      setDirectieSortare('asc');
    }
  }

  function comutaMutatie(m: string) {
    setMutatiiFiltrate((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }

  function comutaStatus(s: StatusPasare) {
    setStatusuriFiltrate((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function comutaSex(s: SexPasare) {
    setSexeFiltrate((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  const aniDisponibili = useMemo(() => {
    if (!pasari) return [];
    const ani = new Set<number>();
    for (const p of pasari) {
      if (p.dataEclozare) ani.add(new Date(p.dataEclozare).getFullYear());
    }
    return [...ani].sort((a, b) => b - a);
  }, [pasari]);

  const mutatiiDisponibile = useMemo(() => {
    if (!pasari) return [];
    const mutatii = new Set<string>();
    for (const p of pasari) {
      for (const m of p.mutatii) mutatii.add(m);
    }
    return [...mutatii].sort((a, b) => a.localeCompare(b, 'ro'));
  }, [pasari]);

  const pasariAfisate = useMemo(() => {
    if (!pasari) return [];

    let rezultat = pasari.filter((p) => {
      if (statusuriFiltrate.size > 0 && !statusuriFiltrate.has(p.status)) return false;
      if (sexeFiltrate.size > 0 && !sexeFiltrate.has(p.sex)) return false;
      if (mutatiiFiltrate.size > 0 && !p.mutatii.some((m) => mutatiiFiltrate.has(m))) return false;
      if (anFiltrat !== 'toate') {
        const an = p.dataEclozare ? new Date(p.dataEclozare).getFullYear() : null;
        if (an !== anFiltrat) return false;
      }
      return true;
    });

    if (campSortare) {
      rezultat = [...rezultat].sort((a, b) => {
        let cmp = 0;
        if (campSortare === 'nrInel') {
          cmp = a.nrInel.localeCompare(b.nrInel, undefined, { numeric: true, sensitivity: 'base' });
        } else {
          const ta = a.dataEclozare ? new Date(a.dataEclozare).getTime() : -Infinity;
          const tb = b.dataEclozare ? new Date(b.dataEclozare).getTime() : -Infinity;
          cmp = ta - tb;
        }
        return directieSortare === 'asc' ? cmp : -cmp;
      });
    }

    return rezultat;
  }, [
    pasari,
    statusuriFiltrate,
    sexeFiltrate,
    mutatiiFiltrate,
    anFiltrat,
    campSortare,
    directieSortare,
  ]);

  const statusEsteImplicit = statusuriFiltrate.size === 1 && statusuriFiltrate.has('ACTIVA');
  const sexEsteImplicit = TOATE_SEXELE.every((s) => sexeFiltrate.has(s));

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Pasari
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onExportExcel}
            disabled={seExporta}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdauga}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
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
                <TableCell>
                  <TableSortLabel
                    active={campSortare === 'nrInel'}
                    direction={campSortare === 'nrInel' ? directieSortare : 'asc'}
                    onClick={() => onSorteazaDupa('nrInel')}
                  >
                    Nr. inel
                  </TableSortLabel>
                </TableCell>
                <TableCell>Rnc</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                    Sex
                    <Tooltip title="Filtreaza dupa sex">
                      <IconButton size="small" onClick={(e) => setAnchorSex(e.currentTarget)}>
                        <FilterListIcon
                          fontSize="inherit"
                          color={!sexEsteImplicit ? 'primary' : 'inherit'}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                    <TableSortLabel
                      active={campSortare === 'dataEclozare'}
                      direction={campSortare === 'dataEclozare' ? directieSortare : 'asc'}
                      onClick={() => onSorteazaDupa('dataEclozare')}
                    >
                      Data eclozarii
                    </TableSortLabel>
                    <Tooltip title="Filtreaza dupa an">
                      <IconButton size="small" onClick={(e) => setAnchorAn(e.currentTarget)}>
                        <FilterListIcon
                          fontSize="inherit"
                          color={anFiltrat !== 'toate' ? 'primary' : 'inherit'}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                    Mutatii
                    <Tooltip title="Filtreaza dupa mutatii">
                      <IconButton size="small" onClick={(e) => setAnchorMutatii(e.currentTarget)}>
                        <FilterListIcon
                          fontSize="inherit"
                          color={mutatiiFiltrate.size > 0 ? 'primary' : 'inherit'}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                    Status
                    <Tooltip title="Filtreaza dupa status">
                      <IconButton size="small" onClick={(e) => setAnchorStatus(e.currentTarget)}>
                        <FilterListIcon
                          fontSize="inherit"
                          color={!statusEsteImplicit ? 'primary' : 'inherit'}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell align="right">Actiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pasariAfisate.map((p) => (
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
              {pasariAfisate.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    {pasari.length === 0
                      ? 'Nu ai adaugat inca nicio pasare.'
                      : 'Nicio pasare nu corespunde filtrelor selectate.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={anchorAn} open={!!anchorAn} onClose={() => setAnchorAn(null)}>
        <MenuItem
          selected={anFiltrat === 'toate'}
          onClick={() => {
            setAnFiltrat('toate');
            setAnchorAn(null);
          }}
        >
          Toti anii
        </MenuItem>
        {aniDisponibili.map((an) => (
          <MenuItem
            key={an}
            selected={anFiltrat === an}
            onClick={() => {
              setAnFiltrat(an);
              setAnchorAn(null);
            }}
          >
            {an}
          </MenuItem>
        ))}
        {aniDisponibili.length === 0 && (
          <MenuItem disabled>Nicio data de eclozare inregistrata</MenuItem>
        )}
      </Menu>

      <Popover
        anchorEl={anchorMutatii}
        open={!!anchorMutatii}
        onClose={() => setAnchorMutatii(null)}
      >
        <Box sx={{ p: 1.5, minWidth: 220 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Filtreaza mutatii</Typography>
            {mutatiiFiltrate.size > 0 && (
              <Button size="small" onClick={() => setMutatiiFiltrate(new Set())}>
                Curata
              </Button>
            )}
          </Stack>
          {mutatiiDisponibile.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nicio mutatie inregistrata
            </Typography>
          ) : (
            <FormGroup>
              {mutatiiDisponibile.map((m) => (
                <FormControlLabel
                  key={m}
                  control={
                    <Checkbox
                      size="small"
                      checked={mutatiiFiltrate.has(m)}
                      onChange={() => comutaMutatie(m)}
                    />
                  }
                  label={m}
                />
              ))}
            </FormGroup>
          )}
        </Box>
      </Popover>

      <Popover anchorEl={anchorStatus} open={!!anchorStatus} onClose={() => setAnchorStatus(null)}>
        <Box sx={{ p: 1.5, minWidth: 200 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Filtreaza status</Typography>
            <Button size="small" onClick={() => setStatusuriFiltrate(new Set(TOATE_STATUSURILE))}>
              Bifeaza tot
            </Button>
          </Stack>
          <FormGroup>
            {TOATE_STATUSURILE.map((s) => (
              <FormControlLabel
                key={s}
                control={
                  <Checkbox
                    size="small"
                    checked={statusuriFiltrate.has(s)}
                    onChange={() => comutaStatus(s)}
                  />
                }
                label={STATUS_LABEL[s]}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

      <Popover anchorEl={anchorSex} open={!!anchorSex} onClose={() => setAnchorSex(null)}>
        <Box sx={{ p: 1.5, minWidth: 180 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Filtreaza sex</Typography>
            <Button size="small" onClick={() => setSexeFiltrate(new Set(TOATE_SEXELE))}>
              Ambele
            </Button>
          </Stack>
          <FormGroup>
            {TOATE_SEXELE.map((s) => (
              <FormControlLabel
                key={s}
                control={
                  <Checkbox
                    size="small"
                    checked={sexeFiltrate.has(s)}
                    onChange={() => comutaSex(s)}
                  />
                }
                label={SEX_LABEL[s]}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

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
