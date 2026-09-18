import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import { getArbore } from '../api/arbore';
import { exportArborePdf } from '../api/pasari';
import type { ArboreGenealogic as ArboreGenealogicTip } from '../types/arbore';
import { ArboreGrafic, LegendaArbore } from './ArboreGenealogic';
import type { OrientareArbore } from './ArboreGenealogic';

const GENERATII_SUS = 5;
const GENERATII_JOS = 2;
const CHEIE_ORIENTARE = 'animaltrack.arboreOrientare';

function orientareInitiala(ecranIngust: boolean): OrientareArbore {
  try {
    const salvata = localStorage.getItem(CHEIE_ORIENTARE);
    if (salvata === 'orizontala' || salvata === 'verticala') return salvata;
  } catch {
    // localStorage indisponibil (mod privat etc.) - folosim implicit dupa marimea ecranului
  }
  return ecranIngust ? 'verticala' : 'orizontala';
}

export function ArboreGenealogicDialog({
  pasareId,
  open,
  onClose,
}: {
  pasareId: string;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const ecranIngust = useMediaQuery('(max-width:600px)');
  const [arbore, setArbore] = useState<ArboreGenealogicTip | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [tab, setTab] = useState<'stramosi' | 'descendenti'>('stramosi');
  const [orientare, setOrientare] = useState<OrientareArbore>(() => orientareInitiala(ecranIngust));
  const [seExportaPdf, setSeExportaPdf] = useState(false);

  useEffect(() => {
    if (!open) return;
    setArbore(null);
    setEroare(null);
    getArbore(pasareId, GENERATII_SUS, GENERATII_JOS)
      .then(setArbore)
      .catch(() => setEroare('Nu am putut incarca arborele genealogic'));
  }, [open, pasareId]);

  function onNodeClick(id: string) {
    onClose();
    navigate(`/pasari/${id}`);
  }

  function onSchimbaOrientare(_e: unknown, valoare: OrientareArbore | null) {
    if (!valoare) return;
    setOrientare(valoare);
    try {
      localStorage.setItem(CHEIE_ORIENTARE, valoare);
    } catch {
      // ignoram - preferinta pur si simplu nu se salveaza intre sesiuni
    }
  }

  async function onExportaPdf() {
    setSeExportaPdf(true);
    try {
      await exportArborePdf(pasareId, tab);
    } finally {
      setSeExportaPdf(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {arbore ? `Arbore genealogic — ${arbore.pasare.nrInel}` : 'Arbore genealogic'}
          </Typography>
          <Tooltip title="Descarca arborele ca PDF (util la vanzare, ca dovada de pedigree)">
            <span>
              <IconButton
                color="inherit"
                onClick={onExportaPdf}
                disabled={!arbore || seExportaPdf}
              >
                <FileDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            bgcolor: 'primary.dark',
            px: 1,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab value="stramosi" label="Stramosi" />
            <Tab value="descendenti" label="Descendenti" />
          </Tabs>

          <ToggleButtonGroup
            size="small"
            value={orientare}
            exclusive
            onChange={onSchimbaOrientare}
            sx={{ my: 0.5, bgcolor: 'background.paper' }}
          >
            <ToggleButton value="orizontala">
              <Tooltip title="Vizualizare orizontala">
                <ViewWeekIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="verticala">
              <Tooltip title="Vizualizare verticala">
                <ViewStreamIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </AppBar>

      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        {eroare && <Alert severity="error">{eroare}</Alert>}

        {!arbore && !eroare && <Skeleton variant="rounded" height={300} />}

        {arbore && (
          <>
            <LegendaArbore />
            <ArboreGrafic arbore={arbore} mod={tab} orientare={orientare} onNodeClick={onNodeClick} />
          </>
        )}
      </Box>
    </Dialog>
  );
}
