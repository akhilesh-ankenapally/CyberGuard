import { Outlet, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ToastStack } from './ToastStack';
import { SidebarNav } from './SidebarNav';

const titles: Record<string, string> = {
  '/': 'CyberGuard',
  '/protection': 'Protection',
  '/activity': 'App Permissions',
  '/app-security': 'App Security',
  '/settings': 'Settings',
};

export function AppShell() {
  const location = useLocation();
  const title = titles[location.pathname] || 'CyberGuard';

  return (
    <main className="relative min-h-screen overflow-hidden text-cyber-text">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_36%),linear-gradient(180deg,#EEF2FF_0%,#F8FAFC_100%)]" />
      <div className="absolute inset-0 cyber-grid opacity-30" />

      <div className="relative mx-auto h-screen w-full max-w-[390px]">
        <div className="relative mx-auto flex h-screen w-full max-w-[390px] flex-col overflow-hidden rounded-[24px] bg-cyber-bg shadow-[0_14px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_44%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.06),transparent_46%)]" />
          <ToastStack />

          <header className="relative z-10 grid h-14 shrink-0 grid-cols-3 items-center bg-[linear-gradient(135deg,rgba(238,242,255,0.96),rgba(224,231,255,0.92))] px-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center">
              <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.5)] text-xs font-medium text-cyber-muted">
                <Shield className="h-5 w-5" />
              </span>
            </div>
            <h1 className="truncate text-center text-lg font-semibold text-cyber-text">{title}</h1>
            <div className="flex items-center justify-end">
              <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.5)] text-xs font-medium text-cyber-green">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-green shadow-[0_0_0_3px_rgba(22,163,74,0.16)]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-cyber-green/45" />
                </span>
              </span>
            </div>
          </header>

          <section className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
            <Outlet />
          </section>

          <div className="relative z-10 shrink-0">
            <SidebarNav />
          </div>
        </div>
      </div>

    </main>
  );
}


