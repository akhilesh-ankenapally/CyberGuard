import { motion } from 'framer-motion';
import { Activity, BellRing, MessageCircle, MessageSquare, Mail, Instagram, Shield, ShieldCheck, Database, Eye, Clock3 } from 'lucide-react';
import { useMemo } from 'react';
import { ToggleSwitch } from '../components';
import { useCyberGuard } from '../context/CyberGuardContext';
import { getRelativeTimeLabel } from '../lib/time';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
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
    <motion.div whileTap={{ scale: 0.99 }} className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))] text-cyber-blue">{icon}</span>
        <span className="truncate text-sm font-medium text-cyber-text">{title}</span>
      </div>
      {right}
    </motion.div>
  );
}

export function SettingsPage() {
  const { activityFeed, monitoringState, connectionState, settings, updateSettings, addSystemActivity } = useCyberGuard();

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
          right={<ToggleSwitch checked={settings.appMonitoring.whatsapp} onChange={() => {
            updateSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, whatsapp: !current.appMonitoring.whatsapp } }));
            addSystemActivity(`WhatsApp monitoring ${settings.appMonitoring.whatsapp ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<Instagram className="h-4 w-4" />}
          title="Instagram"
          right={<ToggleSwitch checked={settings.appMonitoring.instagram} onChange={() => {
            updateSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, instagram: !current.appMonitoring.instagram } }));
            addSystemActivity(`Instagram monitoring ${settings.appMonitoring.instagram ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<MessageSquare className="h-4 w-4" />}
          title="SMS"
          right={<ToggleSwitch checked={settings.appMonitoring.sms} onChange={() => {
            updateSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, sms: !current.appMonitoring.sms } }));
            addSystemActivity(`SMS monitoring ${settings.appMonitoring.sms ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<Mail className="h-4 w-4" />}
          title="Email"
          right={<ToggleSwitch checked={settings.appMonitoring.email} onChange={() => {
            updateSettings((current) => ({ ...current, appMonitoring: { ...current.appMonitoring, email: !current.appMonitoring.email } }));
            addSystemActivity(`Email monitoring ${settings.appMonitoring.email ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
      </SectionCard>

      <SectionCard title="Notifications">
        <SettingRow
          icon={<BellRing className="h-4 w-4" />}
          title="Enable Alerts"
          right={<ToggleSwitch checked={settings.notifications.enableAlerts} onChange={() => {
            updateSettings((current) => ({ ...current, notifications: { ...current.notifications, enableAlerts: !current.notifications.enableAlerts } }));
            addSystemActivity(`Alerts ${settings.notifications.enableAlerts ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Critical Threat Alerts"
          right={<ToggleSwitch checked={settings.notifications.criticalThreatAlerts} onChange={() => {
            updateSettings((current) => ({ ...current, notifications: { ...current.notifications, criticalThreatAlerts: !current.notifications.criticalThreatAlerts } }));
            addSystemActivity(`Critical threat alerts ${settings.notifications.criticalThreatAlerts ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<Activity className="h-4 w-4" />}
          title="Sound"
          right={<ToggleSwitch checked={settings.notifications.sound} onChange={() => {
            updateSettings((current) => ({ ...current, notifications: { ...current.notifications, sound: !current.notifications.sound } }));
            addSystemActivity(`Alert sound ${settings.notifications.sound ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
      </SectionCard>

      <SectionCard title="Protection Settings">
        <SettingRow
          icon={<Shield className="h-4 w-4" />}
          title="Real-time Protection"
          right={<ToggleSwitch checked={settings.protection.realTimeProtection} onChange={() => {
            updateSettings((current) => ({ ...current, protection: { ...current.protection, realTimeProtection: !current.protection.realTimeProtection } }));
            addSystemActivity(`Real-time protection ${settings.protection.realTimeProtection ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Auto Scan"
          right={<ToggleSwitch checked={settings.protection.autoScan} onChange={() => {
            updateSettings((current) => ({ ...current, protection: { ...current.protection, autoScan: !current.protection.autoScan } }));
            addSystemActivity(`Auto scan ${settings.protection.autoScan ? 'disabled' : 'enabled'}`, 'system');
          }} />}
        />
        <SettingRow
          icon={<Clock3 className="h-4 w-4" />}
          title="Scan Frequency"
          right={
            <select
              value={settings.protection.scanFrequency}
              onChange={(event) =>
                updateSettings((current) => ({
                  ...current,
                  protection: { ...current.protection, scanFrequency: event.target.value as '15s' | '30s' | '60s' },
                }))
              }
              className="rounded-[10px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] px-3 py-2 text-sm text-cyber-text outline-none"
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
          right={<ToggleSwitch checked={settings.privacy.dataCollection} onChange={() => updateSettings((current) => ({ ...current, privacy: { ...current.privacy, dataCollection: !current.privacy.dataCollection } }))} />}
        />
        <SettingRow
          icon={<Eye className="h-4 w-4" />}
          title="Anonymous Analytics"
          right={<ToggleSwitch checked={settings.privacy.anonymousAnalytics} onChange={() => updateSettings((current) => ({ ...current, privacy: { ...current.privacy, anonymousAnalytics: !current.privacy.anonymousAnalytics } }))} />}
        />
      </SectionCard>

      <SectionCard title="About">
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-3">
          <span className="text-sm text-cyber-muted">App Version</span>
          <span className="text-sm font-medium text-cyber-text">1.0.0</span>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-3">
          <span className="text-sm text-cyber-muted">Last Scan Time</span>
          <span className="text-sm font-medium text-cyber-text">{lastScanTime}</span>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] px-3 py-3">
          <span className="text-sm text-cyber-muted">System Status</span>
          <span className="text-sm font-medium text-cyber-text">{connectionState === 'disconnected' ? 'Offline' : monitoringState}</span>
        </div>
      </SectionCard>

      <div className="h-2" />
    </div>
  );
}



