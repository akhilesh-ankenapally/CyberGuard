import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useThreatSimulation } from '../hooks/useThreatSimulation';
import type { ActivityEntry, AppAlert, CyberGuardSettings, ProtectionModuleKey, ProtectionModuleState, ThreatRecord } from '../types';

type ToastItem = {
  id: string;
  title: string;
  message: string;
  tone: 'green' | 'yellow' | 'red' | 'blue';
};

type CyberGuardContextValue = ReturnType<typeof useThreatSimulation> & {
  alerts: AppAlert[];
  unreadAlerts: number;
  activityFeed: ActivityEntry[];
  toasts: ToastItem[];
  settings: CyberGuardSettings;
  protectionModules: Record<ProtectionModuleKey, ProtectionModuleState>;
  toggleProtectionModule: (module: ProtectionModuleKey) => void;
  updateSettings: (updater: (current: CyberGuardSettings) => CyberGuardSettings) => void;
  simulatePushNotification: () => void;
  markAlertAsRead: (id: string) => void;
  pushSystemToast: (title: string, message: string, tone?: ToastItem['tone']) => void;
  addSystemActivity: (message: string, category?: ActivityEntry['category']) => void;
};

const CyberGuardContext = createContext<CyberGuardContextValue | null>(null);

function createEntry(message: string, category: ActivityEntry['category']): ActivityEntry {
  return {
    id: `${category}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    message,
    timestamp: new Date().toISOString(),
    category,
  };
}

function toneForRisk(risk: ThreatRecord['risk_level']): ToastItem['tone'] {
  if (risk === 'Threat') return 'red';
  if (risk === 'Suspicious') return 'yellow';
  return 'green';
}

function createAlert(record: ThreatRecord): AppAlert {
  return {
    id: `alert-${record.id}`,
    message: record.message,
    risk_level: record.risk_level,
    timestamp: record.timestamp,
    platform: record.platform,
    explanation: record.explanation,
    read: false,
  };
}

function createToast(record: ThreatRecord): ToastItem {
  return {
    id: `toast-${record.id}`,
    title: `${record.platform} ${record.risk_level}`,
    message: record.message,
    tone: toneForRisk(record.risk_level),
  };
}

const SETTINGS_STORAGE_KEY = 'cyberguard.settings.v1';

const defaultSettings: CyberGuardSettings = {
  appMonitoring: {
    whatsapp: true,
    instagram: true,
    sms: true,
    email: true,
  },
  notifications: {
    enableAlerts: true,
    criticalThreatAlerts: true,
    sound: true,
  },
  protection: {
    realTimeProtection: true,
    autoScan: true,
    scanFrequency: '30s',
  },
  privacy: {
    dataCollection: true,
    anonymousAnalytics: true,
  },
};

function loadSettings(): CyberGuardSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<CyberGuardSettings>;
    return {
      appMonitoring: { ...defaultSettings.appMonitoring, ...parsed.appMonitoring },
      notifications: { ...defaultSettings.notifications, ...parsed.notifications },
      protection: { ...defaultSettings.protection, ...parsed.protection },
      privacy: { ...defaultSettings.privacy, ...parsed.privacy },
    };
  } catch {
    return defaultSettings;
  }
}

function isPlatformMonitoringEnabled(settings: CyberGuardSettings, platform: ThreatRecord['platform']) {
  if (platform === 'WhatsApp') return settings.appMonitoring.whatsapp;
  if (platform === 'Instagram') return settings.appMonitoring.instagram;
  if (platform === 'SMS') return settings.appMonitoring.sms;
  if (platform === 'Email') return settings.appMonitoring.email;
  return true;
}

function shouldCreateAlert(settings: CyberGuardSettings, record: ThreatRecord) {
  if (!settings.notifications.enableAlerts) return false;
  if (record.risk_level === 'Threat' && !settings.notifications.criticalThreatAlerts) return false;
  return record.risk_level === 'Threat' || record.risk_level === 'Suspicious';
}

function scanFrequencyMs(settings: CyberGuardSettings) {
  if (settings.protection.scanFrequency === '15s') return 15000;
  if (settings.protection.scanFrequency === '60s') return 60000;
  return 30000;
}

export function CyberGuardProvider({ children }: { children: React.ReactNode }) {
  const threatState = useThreatSimulation();
  const [settings, setSettings] = useState<CyberGuardSettings>(() => loadSettings());
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([
    createEntry('Real-time protection armed', 'system'),
    createEntry('Streaming backend threat feed connected', 'system'),
    createEntry('Auto Scan scheduler initialized', 'system'),
  ]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [protectionModules, setProtectionModules] = useState<Record<ProtectionModuleKey, ProtectionModuleState>>({
    sms: { enabled: true, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
    call: { enabled: true, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
    app: { enabled: true, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
    web: { enabled: true, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
  });
  const bootstrappedIncomingRef = useRef(false);
  const lastToastAtRef = useRef(0);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const addActivity = (message: string, category: ActivityEntry['category']) => {
    setActivityFeed((current) => [createEntry(message, category), ...current].slice(0, 80));
  };

  const pushToast = (toast: ToastItem) => {
    const now = Date.now();
    if (now - lastToastAtRef.current < 5000) {
      return;
    }

    setToasts((current) => {
      const duplicate = current.some((item) => item.message === toast.message);
      if (duplicate) {
        return current;
      }

      lastToastAtRef.current = now;
      return [toast, ...current].slice(0, 2);
    });

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 3500);
  };

  useEffect(() => {
    if (!threatState.incomingThreats.length) return;
    if (!bootstrappedIncomingRef.current) {
      bootstrappedIncomingRef.current = true;
      return;
    }

    if (!settings.protection.realTimeProtection) {
      return;
    }

    threatState.incomingThreats.forEach((record) => {
      if (!isPlatformMonitoringEnabled(settings, record.platform)) {
        return;
      }

      if (shouldCreateAlert(settings, record)) {
        setAlerts((current) => [createAlert(record), ...current.filter((item) => item.id !== `alert-${record.id}`)].slice(0, 40));
      }

      if (record.risk_level === 'Threat' && settings.notifications.enableAlerts && settings.notifications.criticalThreatAlerts) {
        pushToast(createToast(record));
      }

      addActivity(`Threat detected on ${record.platform}: ${record.message}`, 'notification');
      if (record.risk_level === 'Threat') {
        addActivity(`Blocked suspicious ${record.platform} payload`, 'block');
      }
    });
  }, [settings, threatState.incomingThreats]);

  useEffect(() => {
    if (threatState.allRecords.length === 0) return;
    bootstrappedIncomingRef.current = true;
  }, [threatState.allRecords.length]);

  useEffect(() => {
    if (!settings.protection.autoScan) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const seedMessages = ['Scanning SMS...', 'Analyzed Instagram DM', 'Blocked suspicious URL', 'Completed auto risk sweep'];
      const message = seedMessages[Math.floor(Math.random() * seedMessages.length)];
      addActivity(message, message.includes('Blocked') ? 'block' : 'scan');
    }, scanFrequencyMs(settings));

    return () => window.clearInterval(intervalId);
  }, [settings]);

  const markAlertAsRead = (id: string) => {
    setAlerts((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const toggleProtectionModule = (module: ProtectionModuleKey) => {
    setProtectionModules((current) => {
      const nextEnabled = !current[module].enabled;
      const updated = {
        ...current,
        [module]: {
          enabled: nextEnabled,
          status: nextEnabled ? 'ACTIVE' : 'INACTIVE',
          lastUpdated: new Date().toISOString(),
        },
      };

      addActivity(`${module.toUpperCase()} shield ${nextEnabled ? 'enabled' : 'disabled'}`, 'system');
      return updated;
    });
  };

  const simulatePushNotification = () => {
    if (!settings.notifications.enableAlerts || !settings.notifications.criticalThreatAlerts) {
      addActivity('Push notification simulation skipped by notification settings', 'system');
      return;
    }

    const alert = {
      id: `manual-${Date.now()}`,
      message: 'Critical threat simulation: notification delivery confirmed.',
      risk_level: 'Threat' as const,
      timestamp: new Date().toISOString(),
      platform: 'SMS' as const,
      read: false,
    };

    setAlerts((current) => [alert, ...current].slice(0, 40));
    pushToast({ id: `toast-${alert.id}`, title: 'Critical Threat', message: alert.message, tone: 'red' });
    addActivity('Push notification simulation delivered', 'notification');
  };

  const unreadAlerts = alerts.filter((item) => !item.read).length;

  const pushSystemToast = (title: string, message: string, tone: ToastItem['tone'] = 'blue') => {
    pushToast({ id: `manual-toast-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, title, message, tone });
  };

  const addSystemActivity = (message: string, category: ActivityEntry['category'] = 'system') => {
    addActivity(message, category);
  };

  const updateSettings = (updater: (current: CyberGuardSettings) => CyberGuardSettings) => {
    setSettings((current) => updater(current));
  };

  const value = useMemo<CyberGuardContextValue>(
    () => ({
      ...threatState,
      alerts,
      unreadAlerts,
      activityFeed,
      toasts,
      settings,
      protectionModules,
      toggleProtectionModule,
      updateSettings,
      simulatePushNotification,
      markAlertAsRead,
      pushSystemToast,
      addSystemActivity,
    }),
    [alerts, activityFeed, protectionModules, settings, threatState, toasts, unreadAlerts],
  );

  return <CyberGuardContext.Provider value={value}>{children}</CyberGuardContext.Provider>;
}

export function useCyberGuard() {
  const context = useContext(CyberGuardContext);
  if (!context) {
    throw new Error('useCyberGuard must be used within a CyberGuardProvider');
  }
  return context;
}


