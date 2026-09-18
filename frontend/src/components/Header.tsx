import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../auth/AuthContext';
import { QuickSearch } from './QuickSearch';

const LINKURI_DE_BAZA = [
  { to: '/', label: 'Dashboard' },
  { to: '/pasari', label: 'Pasari' },
  { to: '/perechi', label: 'Perechi' },
  { to: '/statistici', label: 'Statistici' },
  { to: '/setari', label: 'Setari' },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerDeschis, setDrawerDeschis] = useState(false);

  const linkuri = user?.esteAdmin
    ? [...LINKURI_DE_BAZA, { to: '/sugestii-primite', label: 'Sugestii primite' }]
    : LINKURI_DE_BAZA;

  function esteActiv(to: string) {
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  }

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ gap: { xs: 1, md: 2 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setDrawerDeschis(true)}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color: 'inherit',
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: { xs: 140, sm: 260 },
          }}
        >
          {user?.fermaNume || 'AnimalTrack'}
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {linkuri.map((l) => (
            <Button
              key={l.to}
              component={RouterLink}
              to={l.to}
              color="inherit"
              sx={{ opacity: esteActiv(l.to) ? 1 : 0.75 }}
            >
              {l.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <QuickSearch />
        </Box>

        <Typography
          variant="body2"
          sx={{ ml: 1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}
        >
          {user?.email}
        </Typography>
        <Tooltip title="Delogare">
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Drawer anchor="left" open={drawerDeschis} onClose={() => setDrawerDeschis(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <List>
            {linkuri.map((l) => (
              <ListItemButton
                key={l.to}
                component={RouterLink}
                to={l.to}
                selected={esteActiv(l.to)}
                onClick={() => setDrawerDeschis(false)}
              >
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <QuickSearch onNavigat={() => setDrawerDeschis(false)} />
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
