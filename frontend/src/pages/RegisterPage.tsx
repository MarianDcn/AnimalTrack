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

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fermaNume, setFermaNume] = useState('');
  const [fermaAdresa, setFermaAdresa] = useState('');
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState<string | null>(null);
  const [seIncarca, setSeIncarca] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEroare(null);
    setSeIncarca(true);
    try {
      await register(fermaNume, fermaAdresa || undefined, email, parola);
      navigate('/');
    } catch (err: unknown) {
      const mesaj =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Inregistrarea a esuat';
      setEroare(Array.isArray(mesaj) ? mesaj.join(', ') : mesaj);
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
        py: 4,
      }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400 }}
        elevation={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
          Inregistreaza crescatoria
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Creezi ferma si contul tau de administrator
        </Typography>

        {eroare && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {eroare}
          </Alert>
        )}

        <TextField
          label="Numele crescatoriei"
          fullWidth
          required
          margin="normal"
          value={fermaNume}
          onChange={(e) => setFermaNume(e.target.value)}
        />
        <TextField
          label="Adresa (optional)"
          fullWidth
          margin="normal"
          value={fermaAdresa}
          onChange={(e) => setFermaAdresa(e.target.value)}
        />
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
          helperText="Minim 8 caractere"
          value={parola}
          onChange={(e) => setParola(e.target.value)}
        />

        <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={seIncarca}>
          Creeaza contul
        </Button>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Ai deja cont? <Link component={RouterLink} to="/login">Autentifica-te</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
