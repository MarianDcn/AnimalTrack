import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../auth/AuthContext';
import { usePreferinte } from '../preferinte/PreferinteContext';

export function LoginPage() {
  const { login } = useAuth();
  const { preferinte } = usePreferinte();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);
  const [seIncarca, setSeIncarca] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEroare(null);
    setSeIncarca(true);
    try {
      await login(email, parola);
      navigate(preferinte.paginaImplicita);
    } catch {
      setEroare('Email sau parola incorecte');
    } finally {
      setSeIncarca(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 360 }}
        elevation={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
          AnimalTrack
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Autentificare in contul crescatoriei tale
        </Typography>

        {eroare && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {eroare}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Parola"
          type="password"
          fullWidth
          required
          margin="normal"
          value={parola}
          onChange={(e) => setParola(e.target.value)}
        />

        <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={seIncarca}>
          Autentificare
        </Button>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Nu ai cont? <Link component={RouterLink} to="/inregistrare">Inregistreaza-ti crescatoria</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
