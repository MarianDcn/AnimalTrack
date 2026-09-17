import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface AuthUser {
  id: string;
  fermaId: string;
  email: string;
  rol: string;
  fermaNume: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, parola: string) => Promise<void>;
  register: (
    fermaNume: string,
    fermaAdresa: string | undefined,
    email: string,
    parola: string,
  ) => Promise<void>;
  logout: () => void;
  actualizeazaFermaNume: (fermaNume: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function citesteUtilizatorSalvat(): AuthUser | null {
  const raw = localStorage.getItem('utilizator');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(citesteUtilizatorSalvat);

  const salveazaSesiune = useCallback((accessToken: string, utilizator: AuthUser) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('utilizator', JSON.stringify(utilizator));
    setUser(utilizator);
  }, []);

  const login = useCallback(
    async (email: string, parola: string) => {
      const { data } = await apiClient.post('/auth/login', { email, parola });
      salveazaSesiune(data.accessToken, data.utilizator);
    },
    [salveazaSesiune],
  );

  const register = useCallback(
    async (fermaNume: string, fermaAdresa: string | undefined, email: string, parola: string) => {
      const { data } = await apiClient.post('/auth/register', {
        fermaNume,
        fermaAdresa,
        email,
        parola,
      });
      salveazaSesiune(data.accessToken, data.utilizator);
    },
    [salveazaSesiune],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('utilizator');
    setUser(null);
  }, []);

  const actualizeazaFermaNume = useCallback((fermaNume: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const actualizat = { ...prev, fermaNume };
      localStorage.setItem('utilizator', JSON.stringify(actualizat));
      return actualizat;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, actualizeazaFermaNume }),
    [user, login, register, logout, actualizeazaFermaNume],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth trebuie folosit in interiorul AuthProvider');
  }
  return ctx;
}
