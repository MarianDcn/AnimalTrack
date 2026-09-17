import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Header } from './Header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
