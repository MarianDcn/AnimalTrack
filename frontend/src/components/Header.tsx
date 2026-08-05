import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/AuthContext';
import { QuickSearch } from './QuickSearch';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          AnimalTrack
        </Typography>

        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ opacity: location.pathname === '/' ? 1 : 0.75 }}
        >
          Dashboard
        </Button>
        <Button
          component={RouterLink}
          to="/pasari"
          color="inherit"
          sx={{ opacity: location.pathname.startsWith('/pasari') ? 1 : 0.75 }}
        >
          Pasari
        </Button>
        <Button
          component={RouterLink}
          to="/perechi"
          color="inherit"
          sx={{ opacity: location.pathname.startsWith('/perechi') ? 1 : 0.75 }}
        >
          Perechi
        </Button>
        <Button
          component={RouterLink}
          to="/statistici"
          color="inherit"
          sx={{ opacity: location.pathname.startsWith('/statistici') ? 1 : 0.75 }}
        >
          Statistici
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <QuickSearch />

        <Typography variant="body2" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
          {user?.email}
        </Typography>
        <Tooltip title="Delogare">
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
