import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PasariPage } from './pages/PasariPage';
import { PasareDetailPage } from './pages/PasareDetailPage';
import { PerechiPage } from './pages/PerechiPage';
import { PerecheDetailPage } from './pages/PerecheDetailPage';
import { StatisticiPage } from './pages/StatisticiPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/inregistrare" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/pasari"
        element={
          <RequireAuth>
            <AppLayout>
              <PasariPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/pasari/:id"
        element={
          <RequireAuth>
            <AppLayout>
              <PasareDetailPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/perechi"
        element={
          <RequireAuth>
            <AppLayout>
              <PerechiPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/perechi/:id"
        element={
          <RequireAuth>
            <AppLayout>
              <PerecheDetailPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/statistici"
        element={
          <RequireAuth>
            <AppLayout>
              <StatisticiPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
