import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useThreatSimulation } from '../hooks/useThreatSimulation';
import type { ActivityEntry, AppAlert, ProtectionModuleKey, ProtectionModuleState, ThreatRecord } from '../types';

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
  protectionModules: Record<ProtectionModuleKey, ProtectionModuleState>;
  toggleProtectionModule: (module: ProtectionModuleKey) => void;
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

export function CyberGuardProvider({ children }: { children: React.ReactNode }) {
  const threatState = useThreatSimulation();
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

    threatState.incomingThreats.forEach((record) => {
      if (record.risk_level !== 'Safe') {
        setAlerts((current) => [createAlert(record), ...current.filter((item) => item.id !== `alert-${record.id}`)].slice(0, 40));
      }

      if (record.risk_level === 'Threat') {
        pushToast(createToast(record));
      }

      addActivity(`Threat detected on ${record.platform}: ${record.message}`, 'notification');
      if (record.risk_level === 'Threat') {
        addActivity(`Blocked suspicious ${record.platform} payload`, 'block');
      }
    });
  }, [threatState.incomingThreats]);

  useEffect(() => {
    if (threatState.allRecords.length === 0) return;
    bootstrappedIncomingRef.current = true;
  }, [threatState.allRecords.length]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const seedMessages = ['Scanning SMS...', 'Analyzed Instagram DM', 'Blocked suspicious URL', 'Completed auto risk sweep'];
      const message = seedMessages[Math.floor(Math.random() * seedMessages.length)];
      addActivity(message, message.includes('Blocked') ? 'block' : 'scan');
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

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

  const value = useMemo<CyberGuardContextValue>(
    () => ({
      ...threatState,
      alerts,
      unreadAlerts,
      activityFeed,
      toasts,
      protectionModules,
      toggleProtectionModule,
      simulatePushNotification,
      markAlertAsRead,
      pushSystemToast,
      addSystemActivity,
    }),
    [alerts, activityFeed, protectionModules, threatState, toasts, unreadAlerts],
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


