export type Platform = 'WhatsApp' | 'Instagram' | 'Email' | 'SMS';
export type ThreatLevel = 'Safe' | 'Suspicious' | 'Threat';

export type ThreatRecord = {
  id: string;
  message: string;
  platform: Platform;
  sender: string;
  risk_level: ThreatLevel;
  confidence: number;
  timestamp: string;
  explanation: string;
};

export type AnalysisResult = ThreatRecord & {
  source: 'backend' | 'simulation';
};

export type DashboardStats = {
  totalMessages: number;
  threatsDetected: number;
  safeMessages: number;
  suspiciousMessages: number;
};

export type ProtectionModuleKey = 'sms' | 'call' | 'app' | 'web';

export type AppAlert = {
  id: string;
  message: string;
  risk_level: ThreatLevel;
  timestamp: string;
  platform: Platform;
  read: boolean;
};

export type ActivityEntry = {
  id: string;
  message: string;
  timestamp: string;
  category: 'scan' | 'block' | 'analysis' | 'notification' | 'system';
};

export type ProtectionModuleState = {
  enabled: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  lastUpdated: string;
};

export type PermissionUsageState = 'never' | 'occasional' | 'frequent' | 'background' | 'constant';

export type AppUsage = {
  camera: PermissionUsageState;
  mic: PermissionUsageState;
  location: PermissionUsageState;
};

export type AppSecurityRecord = {
  id: string;
  name: string;
  permissions: string[];
  usage: AppUsage;
  risk_score: number;
  risk_level: ThreatLevel;
  explanation: string;
  suggested_actions: string[];
  updated_at: string;
};


