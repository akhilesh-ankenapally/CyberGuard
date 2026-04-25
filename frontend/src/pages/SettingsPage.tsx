import { motion } from 'framer-motion';
import { Activity, BellRing, MessageCircle, MessageSquare, Mail, Instagram, Shield, ShieldCheck, Settings2, Database, Eye, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ToggleSwitch } from '../components';
import { useCyberGuard } from '../context/CyberGuardContext';
import { getRelativeTimeLabel } from '../lib/time';

type AppMonitoringState = {
  whatsapp: boolean;
  instagram: boolean;
  sms: boolean;
  email: boolean;
};

type NotificationSettings = {
  enableAlerts: boolean;
  criticalThreatAlerts: boolean;
  sound: boolean;
};

type ProtectionSettings = {
  realTimeProtection: boolean;
  autoScan: boolean;
  scanFrequency: '15s' | '30s' | '60s';
};

type PrivacySettings = {
  dataCollection: boolean;
  anonymousAnalytics: boolean;
};

type SettingsState = {
  appMonitoring: AppMonitoringState;
  notifications: NotificationSettings;
  protection: ProtectionSettings;
  privacy: PrivacySettings;
};

const STORAGE_KEY = 'cyberguard.settings.v1';

const defaultSettings: SettingsState = {
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

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <p className="text-base font-semibold text-cyber-text">{title}</p>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function SettingRow({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right: React.ReactNode;
}) {
  return (
    <motion.div whileTap={{ scale: 0.99 }} className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[#F3EEE7] px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] bg-[#EAE6DF] text-cyber-blue">{icon}</span>
        <span className="truncate text-sm font-medium text-cyber-text">{title}</span>
      </div>
      {right}
    </motion.div>
  );
}

export function SettingsPage() {
  const { activityFeed, monitoringState, connectionState } = useCyberGuard();
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const lastScanTime = useMemo(() => {
    const entry = activityFeed.find((item) => item.category === 'scan');
    return entry ? getRelativeTimeLabel(entry.timestamp) : 'No recent scan';
  }, [activityFeed]);

  return (
    <div className="flex flex-col gap-3 py-4">
      <SectionCard title="App Monitoring">
        <SettingRow
          icon={<MessageCircle className="h-4 w-4" />}
          title="WhatsApp"
          right={<ToggleSwitch checked={settings.appMonitoring.whatsapp} onChange={() => setSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, whatsapp: !current.appMonitoring.whatsapp } }))} />}
        />
        <SettingRow
          icon={<Instagram className="h-4 w-4" />}
          title="Instagram"
          right={<ToggleSwitch checked={settings.appMonitoring.instagram} onChange={() => setSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, instagram: !current.appMonitoring.instagram } }))} />}
        />
        <SettingRow
          icon={<MessageSquare className="h-4 w-4" />}
          title="SMS"
          right={<ToggleSwitch checked={settings.appMonitoring.sms} onChange={() => setSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, sms: !current.appMonitoring.sms } }))} />}
        />
        <SettingRow
          icon={<Mail className="h-4 w-4" />}
          title="Email"
          right={<ToggleSwitch checked={settings.appMonitoring.email} onChange={() => setSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, email: !current.appMonitoring.email } }))} />}
        />
      </SectionCard>

      <SectionCard title="Notifications">
        <SettingRow
          icon={<BellRing className="h-4 w-4" />}
          title="Enable Alerts"
          right={<ToggleSwitch checked={settings.notifications.enableAlerts} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, enableAlerts: !current.notifications.enableAlerts } }))} />}
        />
        <SettingRow
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Critical Threat Alerts"
          right={<ToggleSwitch checked={settings.notifications.criticalThreatAlerts} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, criticalThreatAlerts: !current.notifications.criticalThreatAlerts } }))} />}
        />
        <SettingRow
          icon={<Activity className="h-4 w-4" />}
          title="Sound"
          right={<ToggleSwitch checked={settings.notifications.sound} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, sound: !current.notifications.sound } }))} />}
        />
      </SectionCard>

      <SectionCard title="Protection Settings">
        <SettingRow
          icon={<Shield className="h-4 w-4" />}
          title="Real-time Protection"
          right={<ToggleSwitch checked={settings.protection.realTimeProtection} onChange={() => setSettings((current) => ({ ...current, protection: { ...current.protection, realTimeProtection: !current.protection.realTimeProtection } }))} />}
        />
        <SettingRow
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Auto Scan"
          right={<ToggleSwitch checked={settings.protection.autoScan} onChange={() => setSettings((current) => ({ ...current, protection: { ...current.protection, autoScan: !current.protection.autoScan } }))} />}
        />
        <SettingRow
          icon={<Clock3 className="h-4 w-4" />}
          title="Scan Frequency"
          right={
            <select
              value={settings.protection.scanFrequency}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  protection: { ...current.protection, scanFrequency: event.target.value as ProtectionSettings['scanFrequency'] },
                }))
              }
              className="rounded-[10px] border border-[#D8D1C7] bg-[#FAF8F5] px-3 py-2 text-sm text-cyber-text outline-none"
            >
              <option value="15s">15s</option>
              <option value="30s">30s</option>
              <option value="60s">60s</option>
            </select>
          }
        />
      </SectionCard>

      <SectionCard title="Privacy">
        <SettingRow
          icon={<Database className="h-4 w-4" />}
          title="Data Collection"
          right={<ToggleSwitch checked={settings.privacy.dataCollection} onChange={() => setSettings((current) => ({ ...current, privacy: { ...current.privacy, dataCollection: !current.privacy.dataCollection } }))} />}
        />
        <SettingRow
          icon={<Eye className="h-4 w-4" />}
          title="Anonymous Analytics"
          right={<ToggleSwitch checked={settings.privacy.anonymousAnalytics} onChange={() => setSettings((current) => ({ ...current, privacy: { ...current.privacy, anonymousAnalytics: !current.privacy.anonymousAnalytics } }))} />}
        />
      </SectionCard>

      <SectionCard title="About">
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[#F3EEE7] px-3 py-3">
          <span className="text-sm text-cyber-muted">App Version</span>
          <span className="text-sm font-medium text-cyber-text">1.0.0</span>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[#F3EEE7] px-3 py-3">
          <span className="text-sm text-cyber-muted">Last Scan Time</span>
          <span className="text-sm font-medium text-cyber-text">{lastScanTime}</span>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[#F3EEE7] px-3 py-3">
          <span className="text-sm text-cyber-muted">System Status</span>
          <span className="text-sm font-medium text-cyber-text">{connectionState === 'disconnected' ? 'Offline' : monitoringState}</span>
        </div>
      </SectionCard>

      <div className="h-2" />
    </div>
  );
}



