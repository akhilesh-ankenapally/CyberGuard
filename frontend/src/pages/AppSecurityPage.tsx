import { AnimatePresence, motion } from 'framer-motion';
import { AppWindow, Camera, ChevronRight, MapPin, Mic, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCyberGuard } from '../context/CyberGuardContext';
import { useAppBehaviorIntelligence } from '../hooks/useAppBehaviorIntelligence';
import type { AppSecurityRecord, ThreatLevel } from '../types';

const riskBadge = {
  Safe: 'bg-cyber-green/10 text-cyber-green border-cyber-green/20',
  Suspicious: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/20',
  Threat: 'bg-cyber-red/10 text-cyber-red border-cyber-red/20',
} as const;

const usageTone = {
  never: 'bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))] text-cyber-muted',
  occasional: 'bg-cyber-blue/10 text-cyber-blue',
  frequent: 'bg-cyber-yellow/10 text-cyber-yellow',
  background: 'bg-cyber-red/10 text-cyber-red',
  constant: 'bg-cyber-red/15 text-cyber-red',
} as const;

const appIcons: Record<string, React.ReactNode> = {
  Instagram: <AppWindow className="h-5 w-5" />,
  WhatsApp: <ShieldCheck className="h-5 w-5" />,
  Telegram: <ShieldCheck className="h-5 w-5" />,
  'Google Maps': <MapPin className="h-5 w-5" />,
  YouTube: <Camera className="h-5 w-5" />,
  Gmail: <ShieldX className="h-5 w-5" />,
};

function riskBarColor(level: ThreatLevel) {
  if (level === 'Threat') return 'from-cyber-red to-red-300';
  if (level === 'Suspicious') return 'from-cyber-yellow to-yellow-300';
  return 'from-cyber-green to-emerald-300';
}

function titleForUsage(key: 'camera' | 'mic' | 'location') {
  if (key === 'camera') return 'Camera';
  if (key === 'mic') return 'Microphone';
  return 'Location';
}

export function AppSecurityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedAppName = searchParams.get('app');
  const { pushSystemToast, addSystemActivity } = useCyberGuard();

  const handleThreatDetected = useCallback(
    (app: AppSecurityRecord) => {
      pushSystemToast(`Privacy Risk: ${app.name}`, 'Potential privacy risk detected', 'red');
      addSystemActivity(`Suspicious behavior detected in ${app.name}`, 'notification');
    },
    [addSystemActivity, pushSystemToast],
  );

  const { apps, selectedApp, selectedAppId, setSelectedAppId, riskSummary, lastThreatApp } = useAppBehaviorIntelligence(handleThreatDetected);

  useEffect(() => {
    if (!linkedAppName || apps.length === 0) return;
    const target = apps.find((app) => app.name.toLowerCase() === linkedAppName.toLowerCase());
    if (!target) return;
    setSelectedAppId(target.id);
  }, [apps, linkedAppName, setSelectedAppId]);

  const appThreats = useMemo(() => apps.filter((app) => app.risk_level === 'Threat'), [apps]);

  useEffect(() => {
    if (!selectedApp) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('app', selectedApp.name);
      return next;
    }, { replace: true });
  }, [selectedApp, setSearchParams]);

  const activeBanner = appThreats[0] || lastThreatApp;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-[28px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] px-5 py-5 shadow-[0_14px_34px_rgba(15,23,42,0.1)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyber-blue/25 bg-cyber-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyber-blue">
          <AppWindow className="h-3.5 w-3.5" />
          App Security
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">App Behavior Intelligence</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-cyber-muted sm:text-base">
          Permission activity is continuously profiled to identify background access misuse, excessive tracking, and privacy threats.
        </p>
      </header>

      <AnimatePresence>
        {activeBanner && activeBanner.risk_level === 'Threat' && (
          <motion.section
            key={activeBanner.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[24px] border border-cyber-red/25 bg-cyber-red/10 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-cyber-red" />
              <div>
                <div className="text-sm font-semibold text-cyber-text">Suspicious behavior detected in {activeBanner.name}</div>
                <div className="mt-1 text-xs text-cyber-muted">Risk score {activeBanner.risk_score} • Review permissions and restrict background access.</div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">Apps monitored</div>
          <div className="mt-2 text-3xl font-bold text-cyber-text">{riskSummary.total}</div>
        </div>
        <div className="glass-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">Threat</div>
          <div className="mt-2 text-3xl font-bold text-cyber-red">{riskSummary.threat}</div>
        </div>
        <div className="glass-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">Suspicious</div>
          <div className="mt-2 text-3xl font-bold text-cyber-yellow">{riskSummary.suspicious}</div>
        </div>
        <div className="glass-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">Safe</div>
          <div className="mt-2 text-3xl font-bold text-cyber-green">{riskSummary.safe}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="glass-card-strong rounded-[30px] p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyber-muted">Live App Risk Stream</p>
            <h2 className="mt-1 text-2xl font-bold">Permission risk analyzer</h2>
          </div>
          <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {apps.map((app) => (
                <motion.button
                  key={app.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${selectedAppId === app.id ? 'border-cyber-green/25 bg-cyber-green/10' : 'border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] hover:border-[rgba(99,102,241,0.25)]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] text-cyber-blue">
                        {appIcons[app.name] || <AppWindow className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-cyber-text">{app.name}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {app.permissions.map((permission) => (
                            <span key={`${app.id}-${permission}`} className="rounded-full border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-2 py-0.5 text-[11px] text-cyber-muted">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskBadge[app.risk_level]}`}>{app.risk_level}</span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {(['camera', 'mic', 'location'] as const).map((key) => (
                      <div key={`${app.id}-${key}`} className="rounded-xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-2.5 py-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-cyber-muted">{titleForUsage(key)}</div>
                        <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${usageTone[app.usage[key]]}`}>{app.usage[key]}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-cyber-muted">
                      <span>Risk score</span>
                      <span>{app.risk_score}/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        animate={{ width: `${app.risk_score}%` }}
                        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                        className={`h-full rounded-full bg-gradient-to-r ${riskBarColor(app.risk_level)}`}
                      />
                    </div>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyber-blue">
                    Open detailed analysis
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass-card-strong rounded-[30px] p-5">
          {selectedApp ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyber-muted">Detailed View</p>
                  <h2 className="mt-1 text-2xl font-bold">{selectedApp.name}</h2>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskBadge[selectedApp.risk_level]}`}>{selectedApp.risk_level}</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-cyber-muted">{selectedApp.explanation}</p>

              <div className="mt-4 grid gap-2">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-cyber-text"><Camera className="h-4 w-4 text-cyber-blue" /> Camera: <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${usageTone[selectedApp.usage.camera]}`}>{selectedApp.usage.camera}</span></div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-cyber-text"><Mic className="h-4 w-4 text-cyber-blue" /> Microphone: <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${usageTone[selectedApp.usage.mic]}`}>{selectedApp.usage.mic}</span></div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-cyber-text"><MapPin className="h-4 w-4 text-cyber-blue" /> Location: <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${usageTone[selectedApp.usage.location]}`}>{selectedApp.usage.location}</span></div>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">Suggested actions</div>
                <div className="mt-3 space-y-2">
                  {selectedApp.suggested_actions.map((action) => (
                    <div key={`${selectedApp.id}-${action}`} className="rounded-xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] px-3 py-2 text-sm text-cyber-text">
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-cyber-muted">No app selected.</div>
          )}
        </div>
      </section>
    </div>
  );
}


