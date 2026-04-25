import { AnimatePresence, motion } from 'framer-motion';
import { AppWindow, Camera, ChevronRight, HardDrive, Instagram, Mail, MapPin, MessageCircle, MessageSquare, Mic, Play, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppBehaviorIntelligence } from '../hooks/useAppBehaviorIntelligence';
import type { AppSecurityRecord, ThreatLevel } from '../types';

type PermissionKey = 'Camera' | 'Microphone' | 'Location' | 'Storage';

type RiskResult = {
  level: ThreatLevel;
  explanation: string;
  actions: string[];
};

const permissionList: PermissionKey[] = ['Camera', 'Microphone', 'Location', 'Storage'];

const riskBadge = {
  Safe: 'bg-cyber-green/12 text-cyber-green',
  Suspicious: 'bg-cyber-yellow/12 text-cyber-yellow',
  Threat: 'bg-cyber-red/12 text-cyber-red',
} as const;

const appIconClasses = {
  whatsapp: 'text-cyber-green',
  instagram: 'text-cyber-red',
  email: 'text-cyber-blue',
  sms: 'text-cyber-blue',
  gmail: 'text-cyber-blue',
  telegram: 'text-cyber-blue',
  youtube: 'text-cyber-red',
  maps: 'text-cyber-yellow',
  unknown: 'text-cyber-muted',
} as const;

function resolveAppIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes('whatsapp')) return { Icon: MessageCircle, tone: appIconClasses.whatsapp };
  if (key.includes('instagram')) return { Icon: Instagram, tone: appIconClasses.instagram };
  if (key.includes('gmail') || key.includes('email')) return { Icon: Mail, tone: appIconClasses.email };
  if (key.includes('sms')) return { Icon: MessageSquare, tone: appIconClasses.sms };
  if (key.includes('telegram')) return { Icon: Send, tone: appIconClasses.telegram };
  if (key.includes('youtube')) return { Icon: Play, tone: appIconClasses.youtube };
  if (key.includes('maps')) return { Icon: MapPin, tone: appIconClasses.maps };
  return { Icon: AppWindow, tone: appIconClasses.unknown };
}

function riskGlow(level: ThreatLevel) {
  if (level === 'Threat') return 'ring-2 ring-cyber-red/20';
  if (level === 'Safe') return 'ring-2 ring-cyber-green/20';
  return 'ring-2 ring-cyber-yellow/20';
}

function toTitle(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getBehaviorLines(app: AppSecurityRecord) {
  const lines: string[] = [];

  if (app.usage.camera === 'frequent' || app.usage.camera === 'constant') {
    lines.push('Camera used frequently');
  }
  if (app.usage.camera === 'background') {
    lines.push('Camera active in background');
  }

  if (app.usage.mic === 'background') {
    lines.push('Microphone active in background');
  } else if (app.usage.mic === 'frequent' || app.usage.mic === 'constant') {
    lines.push('Microphone used frequently');
  }

  if (app.usage.location === 'frequent' || app.usage.location === 'constant') {
    lines.push('Location tracked frequently');
  }

  if (lines.length === 0) {
    lines.push('Permission usage appears normal');
  }

  return lines.slice(0, 2);
}

function computeRisk(app: AppSecurityRecord): RiskResult {
  const micBackground = app.usage.mic === 'background';
  const cameraAccess = app.permissions.includes('Camera') && app.usage.camera !== 'never';
  const micAccess = app.permissions.includes('Microphone') && app.usage.mic !== 'never';
  const locationAccess = app.permissions.includes('Location') && app.usage.location !== 'never';

  if (cameraAccess && micAccess && locationAccess) {
    return {
      level: 'Threat',
      explanation: 'Camera, microphone, and location are all actively used by this app.',
      actions: ['Disable microphone access', 'Restrict background usage'],
    };
  }

  if (micBackground) {
    return {
      level: 'Suspicious',
      explanation: 'Microphone is active in background sessions.',
      actions: ['Disable microphone access', 'Restrict background usage'],
    };
  }

  return {
    level: 'Safe',
    explanation: 'Permission activity matches expected foreground behavior.',
    actions: ['Keep current settings', 'Review permissions weekly'],
  };
}

function iconForPermission(permission: PermissionKey) {
  if (permission === 'Camera') return Camera;
  if (permission === 'Microphone') return Mic;
  if (permission === 'Location') return MapPin;
  return HardDrive;
}

export function ActivityMonitorPage() {
  const { apps } = useAppBehaviorIntelligence();
  const [selectedApp, setSelectedApp] = useState<AppSecurityRecord | null>(null);

  const appRows = useMemo(() => {
    return apps.map((app) => ({
      app,
      risk: computeRisk(app),
      behavior: getBehaviorLines(app),
    }));
  }, [apps]);

  return (
    <div className="flex flex-col gap-3 py-4">
      <section className="rounded-[16px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-cyber-text">App Permissions</p>
          <span className="rounded-full bg-cyber-blue/12 px-3 py-2 text-xs font-medium text-cyber-blue">Live 10-15s</span>
        </div>
        <p className="mt-2 line-clamp-2 break-words text-sm font-medium text-cyber-muted">Permission usage is monitored in real time and risky behavior is highlighted instantly.</p>
      </section>

      <section className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {appRows.map(({ app, risk, behavior }) => {
            const { Icon, tone } = resolveAppIcon(app.name);
            return (
              <motion.button
                key={app.id}
                layout
                type="button"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedApp(app)}
                className="w-full rounded-[16px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 text-left shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className={`inline-flex h-12 min-w-12 items-center justify-center rounded-[12px] bg-[#F3EEE7] ${riskGlow(risk.level)}`}>
                      <Icon className={`h-7 w-7 ${tone}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-cyber-text">{app.name}</p>
                      <p className="mt-2 line-clamp-2 break-words text-sm font-medium text-cyber-muted">{behavior.join(' • ')}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${riskBadge[risk.level]}`}>{risk.level}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {permissionList.map((permission) => {
                    const PermissionIcon = iconForPermission(permission);
                    const enabled = app.permissions.includes(permission);
                    return (
                      <div key={`${app.id}-${permission}`} className="flex items-center justify-between rounded-[12px] bg-[#F3EEE7] px-3 py-3">
                        <span className="inline-flex items-center gap-2">
                          <PermissionIcon className="h-4 w-4 text-cyber-muted" />
                          <span className="text-xs font-medium text-cyber-muted">{permission}</span>
                        </span>
                        <span className={`text-xs font-medium ${enabled ? 'text-cyber-text' : 'text-cyber-muted/70'}`}>{enabled ? 'On' : 'Off'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyber-blue">
                  View details
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ y: 260 }}
              animate={{ y: 0 }}
              exit={{ y: 260 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-t-[24px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 shadow-[0_-8px_26px_rgba(15,23,42,0.14)]"
            >
              {(() => {
                const risk = computeRisk(selectedApp);
                const behavior = getBehaviorLines(selectedApp);

                return (
                  <>
                    <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-lg font-semibold text-cyber-text">{selectedApp.name}</p>
                      <span className={`rounded-full px-3 py-2 text-xs font-medium ${riskBadge[risk.level]}`}>{risk.level}</span>
                    </div>

                    <p className="mt-3 line-clamp-2 break-words text-sm font-medium text-cyber-muted">{risk.explanation}</p>

                    <div className="mt-3 flex flex-col gap-2">
                      {permissionList.map((permission) => (
                        <div key={`${selectedApp.id}-detail-${permission}`} className="flex items-center justify-between rounded-[12px] bg-[#F3EEE7] px-3 py-3">
                          <span className="text-sm font-medium text-cyber-text">{permission}</span>
                          <span className={`text-xs font-medium ${selectedApp.permissions.includes(permission) ? 'text-cyber-green' : 'text-cyber-muted'}`}>
                            {selectedApp.permissions.includes(permission) ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      {(['camera', 'mic', 'location'] as const).map((key) => (
                        <div key={`${selectedApp.id}-${key}`} className="flex items-center justify-between rounded-[12px] bg-[#F3EEE7] px-3 py-3">
                          <span className="text-sm font-medium text-cyber-text">{toTitle(key)}</span>
                          <span className="text-xs font-medium text-cyber-muted">{selectedApp.usage[key]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 rounded-[12px] bg-[#F3EEE7] p-3">
                      <p className="text-xs font-medium text-cyber-muted">Suggested action</p>
                      <div className="mt-2 flex flex-col gap-2">
                        {risk.actions.map((action) => (
                          <p key={`${selectedApp.id}-${action}`} className="line-clamp-2 break-words text-sm font-medium text-cyber-text">
                            {action}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-[12px] bg-cyber-blue/10 p-3">
                      <p className="line-clamp-2 break-words text-xs font-medium text-cyber-blue">Latest behavior: {behavior.join(' • ')}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedApp(null)}
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[12px] bg-[#EAE6DF] px-3 py-3 text-sm font-medium text-cyber-text"
                    >
                      Close
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



