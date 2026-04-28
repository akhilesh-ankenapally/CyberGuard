import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout';
import { CyberGuardProvider } from './context/CyberGuardContext';
import { ActivityMonitorPage } from './pages/ActivityMonitorPage';
import { AppSecurityPage } from './pages/AppSecurityPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectionCenterPage } from './pages/ProtectionCenterPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <CyberGuardProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="protection" element={<ProtectionCenterPage />} />
            <Route path="app-security" element={<AppSecurityPage />} />
            <Route path="activity" element={<ActivityMonitorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CyberGuardProvider>
  );
}


