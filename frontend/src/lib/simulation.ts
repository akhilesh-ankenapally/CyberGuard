import type { AnalysisResult, Platform, ThreatLevel, ThreatRecord } from '../types';
import { platformMeta } from '../data/platforms';
import { sampleMessages, senderPool } from '../data/sampleMessages';

const threatKeywordMap = [
  { keywords: ['urgent', 'expires', 'blocked', 'verify', 'tap here', 'claim', 'refund', 'password reset'], level: 'Threat' as ThreatLevel },
  { keywords: ['delivery', 'invoice', 'analytics', 'collab', 'payment', 'review', 'login', 'security alert', 'otp'], level: 'Suspicious' as ThreatLevel },
];

const safePhrases = ['photo', 'summary', 'team', 'project', 'meeting', 'report'];

export function randomPlatform(): Platform {
  const platforms = Object.keys(platformMeta) as Platform[];
  return platforms[Math.floor(Math.random() * platforms.length)];
}

export function randomSender(platform: Platform): string {
  const names = senderPool[platform];
  return names[Math.floor(Math.random() * names.length)];
}

export function randomMessage(platform: Platform): string {
  const messages = sampleMessages[platform];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function generateSimulationRecord(): ThreatRecord {
  const platform = randomPlatform();
  const message = randomMessage(platform);
  return analyzeMessage(message, platform, randomSender(platform));
}

export function analyzeMessage(message: string, platform: Platform, sender = 'User Input'): AnalysisResult {
  const normalized = message.toLowerCase();
  let risk_level: ThreatLevel = 'Safe';
  let confidence = 79;
  let explanation = 'Pattern scan indicates routine communication with low anomaly score.';

  const threatRule = threatKeywordMap.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  if (threatRule?.level === 'Threat') {
    risk_level = 'Threat';
    confidence = 91 + Math.floor(Math.random() * 8);
    explanation = 'Detected high-risk urgency cues, suspicious link language, or credential pressure.';
  } else if (threatRule?.level === 'Suspicious') {
    risk_level = 'Suspicious';
    confidence = 72 + Math.floor(Math.random() * 12);
    explanation = 'Message contains brand, delivery, or login language commonly used in phishing flows.';
  } else if (safePhrases.some((phrase) => normalized.includes(phrase))) {
    risk_level = 'Safe';
    confidence = 86 + Math.floor(Math.random() * 10);
    explanation = 'No material indicators of impersonation, urgency, or credential harvesting were found.';
  } else if (normalized.length > 120) {
    risk_level = 'Suspicious';
    confidence = 68 + Math.floor(Math.random() * 10);
    explanation = 'Long-form message with moderate risk features and ambiguous sender intent.';
  }

  if (platform === 'Email' && risk_level === 'Safe' && normalized.includes('invoice')) {
    risk_level = 'Suspicious';
    confidence = 77;
    explanation = 'Invoice context can conceal malicious attachments or payment redirection attempts.';
  }

  const id = `${platform}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  return {
    id,
    message,
    platform,
    sender,
    risk_level,
    confidence,
    timestamp: new Date().toISOString(),
    explanation,
    source: 'simulation',
  };
}

export function createTrendPoints(records: ThreatRecord[]) {
  const buckets = records.slice(-12).map((record, index) => ({
    label: `T-${Math.max(11 - index, 0)}`,
    value: record.risk_level === 'Threat' ? 3 : record.risk_level === 'Suspicious' ? 2 : 1,
  }));
  return buckets.length > 0 ? buckets : [{ label: 'T-0', value: 1 }];
}


