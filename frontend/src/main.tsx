import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { PreferinteProvider } from './preferinte/PreferinteContext.tsx';
import { ActualizarePWA } from './pwa/ActualizarePWA.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreferinteProvider>
          <App />
          <ActualizarePWA />
        </PreferinteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
