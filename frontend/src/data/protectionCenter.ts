import type { ProtectionModuleKey } from '../types';

export type ProtectionModuleContent = {
  title: string;
  description: string;
  label: string;
};

export type SmsScanRecord = {
  sender: string;
  message: string;
  risk: 'Safe' | 'Suspicious' | 'Threat';
  time: string;
};

export type CallLogRecord = {
  contact: string;
  note: string;
  risk: 'Safe' | 'Suspicious' | 'Threat';
  duration: string;
};

export type AppPermissionRecord = {
  name: string;
  permissions: string[];
  risk: 'Safe' | 'Suspicious' | 'Threat';
};

export type WebLogRecord = {
  url: string;
  reason: string;
  risk: 'Safe' | 'Suspicious' | 'Threat';
  time: string;
};

export const protectionModules: Record<ProtectionModuleKey, ProtectionModuleContent> = {
  sms: {
    title: 'SMS Shield',
    description: 'Scan incoming messages for phishing, impersonation, and delivery scams.',
    label: 'Message protection',
  },
  call: {
    title: 'Call Shield',
    description: 'Simulate suspicious call detection with caller intelligence and risk labels.',
    label: 'Voice protection',
  },
  app: {
    title: 'App Shield',
    description: 'Review installed apps, permissions, and risky access patterns in one view.',
    label: 'App hardening',
  },
  web: {
    title: 'Web Shield',
    description: 'Block malicious URLs and surface detection logs from browsing activity.',
    label: 'Web filtering',
  },
};

export const recentSmsScans: SmsScanRecord[] = [
  { sender: 'Bank Alert', message: 'Your OTP is 482193 for login', risk: 'Suspicious', time: '2 min ago' },
  { sender: 'Unknown Contact', message: 'Urgent: your account will be blocked unless you tap here', risk: 'Threat', time: '7 min ago' },
  { sender: 'Priya', message: 'Can you review this photo from the trip?', risk: 'Safe', time: '12 min ago' },
  { sender: 'Delivery Bot', message: 'Package held at depot, confirm address now', risk: 'Suspicious', time: '18 min ago' },
];

export const recentCallLogs: CallLogRecord[] = [
  { contact: 'Unknown Caller', note: 'Automated voice prompt requested credentials.', risk: 'Threat', duration: '00:42' },
  { contact: 'Courier Verification', note: 'Caller requested delivery confirmation and payment.', risk: 'Suspicious', duration: '01:12' },
  { contact: 'Mom', note: 'Routine family check-in with no anomaly.', risk: 'Safe', duration: '04:08' },
  { contact: 'Support Desk', note: 'Number spoofing indicators detected.', risk: 'Threat', duration: '00:58' },
];

export const appPermissionRecords: AppPermissionRecord[] = [
  { name: 'WhatsApp', permissions: ['Camera', 'Microphone', 'Contacts'], risk: 'Safe' },
  { name: 'Instagram', permissions: ['Camera', 'Location', 'Notifications'], risk: 'Suspicious' },
  { name: 'Telegram', permissions: ['Files', 'Contacts', 'Storage'], risk: 'Suspicious' },
  { name: 'Unknown Utility', permissions: ['Accessibility', 'Overlay', 'SMS'], risk: 'Threat' },
];

export const webBlockLogs: WebLogRecord[] = [
  { url: 'secure-login-bank[.]com', reason: 'Credential harvesting pattern blocked.', risk: 'Threat', time: 'Just now' },
  { url: 'delivery-status[.]link', reason: 'Redirected to a known phishing chain.', risk: 'Suspicious', time: '4 min ago' },
  { url: 'company-portal[.]internal', reason: 'Allowed after reputation check.', risk: 'Safe', time: '9 min ago' },
  { url: 'reward-center[.]promo', reason: 'Malicious script signature detected.', risk: 'Threat', time: '14 min ago' },
];


