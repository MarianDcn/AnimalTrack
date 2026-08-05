import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { getArbore } from '../api/arbore';
import type { ArboreGenealogic as ArboreGenealogicTip } from '../types/arbore';
import { ArboreDescendenti, ArboreStramosi } from './ArboreGenealogic';

const GENERATII_SUS = 3;
const GENERATII_JOS = 2;

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
  const [arbore, setArbore] = useState<ArboreGenealogicTip | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [tab, setTab] = useState<'stramosi' | 'descendenti'>('stramosi');

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

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {arbore ? `Arbore genealogic — ${arbore.pasare.nrInel}` : 'Arbore genealogic'}
          </Typography>
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab value="stramosi" label="Stramosi" />
          <Tab value="descendenti" label="Descendenti" />
        </Tabs>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {eroare && <Alert severity="error">{eroare}</Alert>}

        {!arbore && !eroare && <Skeleton variant="rounded" height={300} />}

        {arbore && tab === 'stramosi' && (
          <ArboreStramosi arbore={arbore} generatiiSus={GENERATII_SUS} onNodeClick={onNodeClick} />
        )}

        {arbore && tab === 'descendenti' && (
          <ArboreDescendenti descendenti={arbore.descendenti} onNodeClick={onNodeClick} />
        )}
      </Box>
    </Dialog>
  );
}
