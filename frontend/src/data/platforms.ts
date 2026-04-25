import { Mail, MessageCircle, Send, Instagram } from 'lucide-react';
import type { Platform, ThreatLevel } from '../types';

export const platformMeta: Record<Platform, { icon: typeof MessageCircle; accent: string; label: string }> = {
  WhatsApp: { icon: MessageCircle, accent: '#22C55E', label: 'Encrypted chat' },
  Instagram: { icon: Instagram, accent: '#3B82F6', label: 'Social DM' },
  Email: { icon: Mail, accent: '#FACC15', label: 'Inbox message' },
  SMS: { icon: Send, accent: '#EF4444', label: 'Carrier text' },
};

export const threatPalette: Record<ThreatLevel, { foreground: string; background: string; glow: string }> = {
  Safe: { foreground: '#22C55E', background: 'rgba(34, 197, 94, 0.14)', glow: 'rgba(34, 197, 94, 0.22)' },
  Suspicious: { foreground: '#CA8A04', background: 'rgba(250, 204, 21, 0.16)', glow: 'rgba(250, 204, 21, 0.22)' },
  Threat: { foreground: '#EF4444', background: 'rgba(239, 68, 68, 0.14)', glow: 'rgba(239, 68, 68, 0.22)' },
};


