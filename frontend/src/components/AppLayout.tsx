import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Header } from './Header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'grey.50' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
