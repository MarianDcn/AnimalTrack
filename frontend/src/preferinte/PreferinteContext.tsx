import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { actualizeazaPreferinteServer, getPreferinteServer } from '../api/preferinte';
import { useAuth } from '../auth/AuthContext';

export type TemaMod = 'deschis' | 'intunecat' | 'automat';
export type DensitateTabel = 'compacta' | 'confortabila';
export type MarimeText = 'normal' | 'mare';
export type PaginaImplicita = '/' | '/pasari' | '/perechi' | '/statistici';

export interface PreferinteInterfata {
  tema: TemaMod;
  culoarePrincipala: string;
  densitateTabele: DensitateTabel;
  marimeText: MarimeText;
  paginaImplicita: PaginaImplicita;
}

export const PREFERINTE_IMPLICITE: PreferinteInterfata = {
  tema: 'deschis',
  culoarePrincipala: '#2e7d32',
  densitateTabele: 'compacta',
  marimeText: 'normal',
  paginaImplicita: '/',
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

function salveazaLocal(preferinte: PreferinteInterfata) {
  try {
    localStorage.setItem(CHEIE_STOCARE, JSON.stringify(preferinte));
  } catch {
    // localStorage indisponibil (mod privat etc.) - ramane doar sincronizarea cu serverul
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
  const { user } = useAuth();
  const [preferinte, setPreferinte] = useState<PreferinteInterfata>(incarcaPreferinte);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const utilizatorSincronizat = useRef<string | null>(null);

  // Oglindeste mereu ultima valoare a lui `preferinte`, ca operatiile din coada
  // (mai jos) sa poata citi starea reala din momentul in care chiar ruleaza,
  // nu din momentul in care au fost programate.
  const preferinteRef = useRef(preferinte);
  useEffect(() => {
    preferinteRef.current = preferinte;
  }, [preferinte]);

  // Cererile catre server se trimit una dupa alta (nu in paralel), ca sa nu poata
  // ajunge doua PATCH-uri intr-o ordine gresita si sa se suprascrie reciproc -
  // de exemplu migrarea initiala si o schimbare facuta chiar atunci de utilizator.
  const coadaSincronizare = useRef<Promise<unknown>>(Promise.resolve());
  function trimitePeCoada(operatie: () => Promise<unknown>) {
    coadaSincronizare.current = coadaSincronizare.current.then(operatie, operatie);
  }

  // La autentificare (sau la reincarcarea paginii cu o sesiune existenta), aducem
  // preferintele salvate pe cont, ca sa fie aceleasi pe orice dispozitiv. Daca acest
  // cont nu are inca nimic salvat pe server, urcam ce avem local (migrare unica).
  useEffect(() => {
    if (!user || utilizatorSincronizat.current === user.id) return;
    utilizatorSincronizat.current = user.id;

    trimitePeCoada(() =>
      getPreferinteServer()
        .then((dinServer) => {
          if (dinServer && Object.keys(dinServer).length > 0) {
            const combinate = { ...preferinteRef.current, ...dinServer };
            salveazaLocal(combinate);
            setPreferinte(combinate);
          } else {
            // executat abia cand ii vine randul in coada, deci citeste starea
            // cea mai proaspata (poate include, intre timp, o schimbare a utilizatorului)
            trimitePeCoada(() => actualizeazaPreferinteServer(preferinteRef.current).catch(() => {}));
          }
        })
        .catch(() => {
          // fara conexiune sau server indisponibil - continuam cu preferintele locale
        }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) utilizatorSincronizat.current = null;
  }, [user]);

  function actualizeazaPreferinte(partiale: Partial<PreferinteInterfata>) {
    setPreferinte((prev) => {
      const actualizate = { ...prev, ...partiale };
      salveazaLocal(actualizate);
      return actualizate;
    });
    if (user) {
      trimitePeCoada(() =>
        actualizeazaPreferinteServer(partiale).catch(() => {
          // esec retea - preferinta ramane aplicata local, se retrimite la urmatoarea schimbare
        }),
      );
    }
  }

  function reseteazaPreferinte() {
    setPreferinte(PREFERINTE_IMPLICITE);
    salveazaLocal(PREFERINTE_IMPLICITE);
    if (user) {
      trimitePeCoada(() => actualizeazaPreferinteServer(PREFERINTE_IMPLICITE).catch(() => {}));
    }
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
        typography: {
          fontSize: preferinte.marimeText === 'mare' ? 16 : 14,
        },
        components: {
          MuiTable: {
            defaultProps: {
              size: preferinte.densitateTabele === 'compacta' ? 'small' : 'medium',
            },
          },
        },
      }),
    [modEfectiv, preferinte.culoarePrincipala, preferinte.densitateTabele, preferinte.marimeText],
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
