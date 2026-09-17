import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export type TemaMod = 'deschis' | 'intunecat' | 'automat';
export type DensitateTabel = 'compacta' | 'confortabila';

export interface PreferinteInterfata {
  tema: TemaMod;
  culoarePrincipala: string;
  densitateTabele: DensitateTabel;
}

export const PREFERINTE_IMPLICITE: PreferinteInterfata = {
  tema: 'deschis',
  culoarePrincipala: '#2e7d32',
  densitateTabele: 'compacta',
};

export const CULORI_PRESTABILITE = [
  { nume: 'Verde', valoare: '#2e7d32' },
  { nume: 'Albastru', valoare: '#1565c0' },
  { nume: 'Mov', valoare: '#6a1b9a' },
  { nume: 'Portocaliu', valoare: '#ef6c00' },
  { nume: 'Turcoaz', valoare: '#00838f' },
  { nume: 'Rosu', valoare: '#c62828' },
];

const CHEIE_STOCARE = 'animaltrack.preferinteInterfata';

function incarcaPreferinte(): PreferinteInterfata {
  try {
    const bruta = localStorage.getItem(CHEIE_STOCARE);
    if (!bruta) return PREFERINTE_IMPLICITE;
    const parsate = JSON.parse(bruta) as Partial<PreferinteInterfata>;
    return { ...PREFERINTE_IMPLICITE, ...parsate };
  } catch {
    return PREFERINTE_IMPLICITE;
  }
}

interface PreferinteContextValoare {
  preferinte: PreferinteInterfata;
  actualizeazaPreferinte: (partiale: Partial<PreferinteInterfata>) => void;
  reseteazaPreferinte: () => void;
}

const PreferinteContext = createContext<PreferinteContextValoare | null>(null);

export function usePreferinte(): PreferinteContextValoare {
  const ctx = useContext(PreferinteContext);
  if (!ctx) throw new Error('usePreferinte trebuie folosit in interiorul PreferinteProvider');
  return ctx;
}

export function PreferinteProvider({ children }: { children: ReactNode }) {
  const [preferinte, setPreferinte] = useState<PreferinteInterfata>(incarcaPreferinte);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    try {
      localStorage.setItem(CHEIE_STOCARE, JSON.stringify(preferinte));
    } catch {
      // localStorage indisponibil (mod privat etc.) - preferinta nu se salveaza intre sesiuni
    }
  }, [preferinte]);

  function actualizeazaPreferinte(partiale: Partial<PreferinteInterfata>) {
    setPreferinte((prev) => ({ ...prev, ...partiale }));
  }

  function reseteazaPreferinte() {
    setPreferinte(PREFERINTE_IMPLICITE);
  }

  const modEfectiv: 'light' | 'dark' =
    preferinte.tema === 'automat'
      ? prefersDark
        ? 'dark'
        : 'light'
      : preferinte.tema === 'intunecat'
        ? 'dark'
        : 'light';

  const tema = useMemo(
    () =>
      createTheme({
        palette: {
          mode: modEfectiv,
          primary: { main: preferinte.culoarePrincipala },
          secondary: { main: '#ff8f00' },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiTable: {
            defaultProps: {
              size: preferinte.densitateTabele === 'compacta' ? 'small' : 'medium',
            },
          },
        },
      }),
    [modEfectiv, preferinte.culoarePrincipala, preferinte.densitateTabele],
  );

  return (
    <PreferinteContext.Provider
      value={{ preferinte, actualizeazaPreferinte, reseteazaPreferinte }}
    >
      <ThemeProvider theme={tema}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </PreferinteContext.Provider>
  );
}
