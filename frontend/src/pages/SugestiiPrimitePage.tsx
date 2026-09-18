import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getToateSugestiile } from '../api/sugestii';
import type { SugestiePrimita } from '../types/sugestie';

export function SugestiiPrimitePage() {
  const [sugestii, setSugestii] = useState<SugestiePrimita[] | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);

  useEffect(() => {
    getToateSugestiile()
      .then(setSugestii)
      .catch(() => setEroare('Nu am putut incarca sugestiile (probabil nu ai acces la aceasta pagina)'));
  }, []);

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Sugestii primite
      </Typography>

      {eroare && <Alert severity="error">{eroare}</Alert>}

      {!sugestii && !eroare && <Skeleton variant="rounded" height={200} />}

      {sugestii && sugestii.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nicio sugestie trimisa inca.
        </Typography>
      )}

      {sugestii && sugestii.length > 0 && (
        <Stack spacing={2}>
          {sugestii.map((s) => (
            <Card key={s.id} variant="outlined">
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1.5 }}>
                  {s.mesaj}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Chip size="small" label={s.ferma.nume} />
                  <Chip size="small" variant="outlined" label={s.utilizator.email} />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={new Date(s.dataCreare).toLocaleString('ro-RO')}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
