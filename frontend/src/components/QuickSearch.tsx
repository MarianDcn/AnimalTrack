import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { cautaPasariDupaInel } from '../api/pasari';
import type { PasareCautareRezultat } from '../types/pasare';

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

export function QuickSearch() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [optiuni, setOptiuni] = useState<PasareCautareRezultat[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  useEffect(() => {
    if (input.trim().length === 0) {
      setOptiuni([]);
      return;
    }

    let anulat = false;
    setSeIncarca(true);
    const timer = setTimeout(async () => {
      try {
        const rezultate = await cautaPasariDupaInel(input.trim());
        if (!anulat) setOptiuni(rezultate);
      } finally {
        if (!anulat) setSeIncarca(false);
      }
    }, 300);

    return () => {
      anulat = true;
      clearTimeout(timer);
    };
  }, [input]);

  return (
    <Autocomplete
      sx={{ width: 340 }}
      options={optiuni}
      loading={seIncarca}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.nrInel}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      noOptionsText={input ? 'Nicio pasare gasita' : 'Cauta dupa nr. inel'}
      onInputChange={(_e, valoare) => setInput(valoare)}
      onChange={(_e, valoare) => {
        if (valoare) navigate(`/pasari/${valoare.id}`);
      }}
      renderOption={(props, optiune) => (
        <Box component="li" {...props} key={optiune.id} sx={{ display: 'block !important' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {optiune.nrInel} {optiune.nume ? `- ${optiune.nume}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {SEX_LABEL[optiune.sex]}
            {optiune.varsta ? ` - ${optiune.varsta.ani}a ${optiune.varsta.luni}l` : ''}
            {optiune.mutatie ? ` - ${optiune.mutatie}` : ''}
            {optiune.tata ? ` - tata: ${optiune.tata.nrInel}` : ''}
            {optiune.mama ? ` - mama: ${optiune.mama.nrInel}` : ''}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Cauta dupa nr. inel..."
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {seIncarca ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
