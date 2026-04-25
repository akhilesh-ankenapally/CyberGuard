import type { AppSecurityRecord, AppUsage, ThreatLevel } from '../types';

export const usageStates = ['never', 'occasional', 'frequent', 'background', 'constant'] as const;

const riskWeightByUsage: Record<AppUsage[keyof AppUsage], number> = {
  never: 0,
  occasional: 8,
  frequent: 18,
  background: 28,
  constant: 32,
};

function calculateRiskLevel(score: number): ThreatLevel {
  if (score >= 75) return 'Threat';
  if (score >= 45) return 'Suspicious';
  return 'Safe';
}

function buildSuggestedActions(usage: AppUsage, permissions: string[], level: ThreatLevel) {
  const actions: string[] = [];

  if (usage.mic === 'background') {
    actions.push('Revoke microphone access');
    actions.push('Limit background usage');
  }
  if (usage.location === 'constant') {
    actions.push('Switch location access to while using app');
  }
  if (permissions.length >= 5) {
    actions.push('Review unnecessary permissions and disable unused access');
  }
  if (usage.camera === 'background' || usage.camera === 'frequent') {
    actions.push('Disable camera access for background sessions');
  }
  if (level === 'Safe') {
    actions.push('Keep current permissions and monitor weekly behavior reports');
  }

  return Array.from(new Set(actions)).slice(0, 4);
}

function buildExplanation(usage: AppUsage, permissions: string[], level: ThreatLevel) {
  const findings: string[] = [];
  if (usage.mic === 'background') findings.push('microphone active in background sessions');
  if (usage.camera === 'background') findings.push('camera access outside foreground usage');
  if (usage.location === 'constant') findings.push('continuous location tracking');
  if (permissions.length >= 5) findings.push('broad permission footprint');

  if (findings.length === 0) {
    return 'Permission profile appears consistent with expected usage patterns.';
  }

  if (level === 'Threat') {
    return `High-risk behavior detected: ${findings.join(', ')}.`;
  }

  if (level === 'Suspicious') {
    return `Behavioral anomalies observed: ${findings.join(', ')}.`;
  }

  return `Minor signals noted: ${findings.join(', ')}.`;
}

export function analyzeAppRisk(base: Omit<AppSecurityRecord, 'risk_level' | 'risk_score' | 'explanation' | 'suggested_actions' | 'updated_at'>): AppSecurityRecord {
  const permissionWeight = base.permissions.length * 7;
  const usageWeight = riskWeightByUsage[base.usage.camera] + riskWeightByUsage[base.usage.mic] + riskWeightByUsage[base.usage.location];

  let ruleBonus = 0;
  if (base.usage.mic === 'background' || base.usage.camera === 'background') {
    ruleBonus += 20;
  }
  if (base.usage.location === 'constant') {
    ruleBonus += 16;
  }
  if (base.permissions.length >= 5 && (base.usage.camera === 'frequent' || base.usage.camera === 'background' || base.usage.mic === 'background')) {
    ruleBonus += 24;
  }
  if (base.usage.mic === 'background' && base.usage.camera === 'frequent') {
    ruleBonus += 30;
  }

  const risk_score = Math.max(8, Math.min(99, permissionWeight + usageWeight + ruleBonus));
  const risk_level = calculateRiskLevel(risk_score);
  const explanation = buildExplanation(base.usage, base.permissions, risk_level);
  const suggested_actions = buildSuggestedActions(base.usage, base.permissions, risk_level);

  return {
    ...base,
    risk_score,
    risk_level,
    explanation,
    suggested_actions,
    updated_at: new Date().toISOString(),
  };
}

export const initialAppSecurityData: AppSecurityRecord[] = [
  analyzeAppRisk({
    id: 'app-instagram',
    name: 'Instagram',
    permissions: ['Camera', 'Microphone', 'Location', 'Photos', 'Notifications'],
    usage: { camera: 'frequent', mic: 'background', location: 'constant' },
  }),
  analyzeAppRisk({
    id: 'app-whatsapp',
    name: 'WhatsApp',
    permissions: ['Camera', 'Microphone', 'Contacts', 'Storage', 'Notifications'],
    usage: { camera: 'occasional', mic: 'frequent', location: 'never' },
  }),
  analyzeAppRisk({
    id: 'app-telegram',
    name: 'Telegram',
    permissions: ['Microphone', 'Contacts', 'Files', 'Notifications'],
    usage: { camera: 'never', mic: 'occasional', location: 'never' },
  }),
  analyzeAppRisk({
    id: 'app-maps',
    name: 'Google Maps',
    permissions: ['Location', 'Camera', 'Microphone', 'Notifications'],
    usage: { camera: 'never', mic: 'never', location: 'constant' },
  }),
  analyzeAppRisk({
    id: 'app-youtube',
    name: 'YouTube',
    permissions: ['Microphone', 'Camera', 'Storage', 'Notifications'],
    usage: { camera: 'never', mic: 'occasional', location: 'never' },
  }),
  analyzeAppRisk({
    id: 'app-gmail',
    name: 'Gmail',
    permissions: ['Contacts', 'Storage', 'Notifications'],
    usage: { camera: 'never', mic: 'never', location: 'never' },
  }),
];

export function mutateUsageState(current: AppUsage): AppUsage {
  const next = { ...current };
  const target = (['camera', 'mic', 'location'] as const)[Math.floor(Math.random() * 3)];
  const moves: AppUsage[keyof AppUsage][] = ['never', 'occasional', 'frequent', 'background', 'constant'];
  const currentIndex = moves.indexOf(current[target]);
  const nextIndex = Math.max(0, Math.min(moves.length - 1, currentIndex + (Math.random() > 0.5 ? 1 : -1)));
  next[target] = moves[nextIndex];

  if (Math.random() > 0.75) {
    const secondTarget = (['camera', 'mic', 'location'] as const)[Math.floor(Math.random() * 3)];
    const secondIndex = Math.max(0, Math.min(moves.length - 1, moves.indexOf(next[secondTarget]) + (Math.random() > 0.5 ? 1 : -1)));
    next[secondTarget] = moves[secondIndex];
  }

  return next;
}


