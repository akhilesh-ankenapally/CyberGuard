import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { platformMeta, threatPalette } from '../data/platforms';
import { getRelativeTimeLabel } from '../lib/time';
import type { ThreatRecord } from '../types';

type Props = {
  record: ThreatRecord;
  highlight?: boolean;
  onAnalyzeApp?: (record: ThreatRecord) => void;
};

function formatConfidence(value: number) {
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return `${Math.round(value)}%`;
}

export function MessageItem({ record, highlight = false, onAnalyzeApp }: Props) {
  const meta = platformMeta[record.platform];
  const threat = threatPalette[record.risk_level];
  const Icon = meta.icon;
  const anomaly = record.risk_level === 'Threat' ? 'Anomaly Spike' : record.risk_level === 'Suspicious' ? 'Behavioral Drift' : 'Stable Signal';
  const confidenceValue = record.confidence <= 1 ? Math.round(record.confidence * 100) : Math.round(record.confidence);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`mb-3 rounded-[24px] border bg-[#FAF8F5] p-4 transition hover:border-[#CEC4B7] hover:bg-[#F3EEE7] ${
        highlight ? 'border-cyber-green/35 shadow-[0_10px_26px_rgba(22,163,74,0.14)]' : 'border-[#D8D1C7]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8D1C7] bg-[#F3EEE7]" style={{ boxShadow: `0 0 0 1px ${meta.accent}22` }}>
          <Icon className="h-5 w-5" style={{ color: meta.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-cyber-text">{record.platform} • {record.sender}</span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: threat.background, color: threat.foreground }}>
              Severity: {record.risk_level}
            </span>
            <span className="rounded-full border border-[#D8D1C7] bg-[#F3EEE7] px-2.5 py-1 text-[11px] font-semibold text-cyber-muted">
              {anomaly}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-cyber-muted">{record.message}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full" style={{ width: `${Math.min(confidenceValue, 100)}%`, backgroundColor: meta.accent }} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-cyber-muted">
            <span>{getRelativeTimeLabel(record.timestamp)}</span>
            <span>{formatConfidence(confidenceValue)} confidence</span>
          </div>
          {onAnalyzeApp && (record.platform === 'Instagram' || record.platform === 'WhatsApp') && (
            <button
              type="button"
              onClick={() => onAnalyzeApp(record)}
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-cyber-blue/25 bg-cyber-blue/10 px-2.5 py-1 text-[11px] font-semibold text-cyber-blue transition hover:brightness-110"
            >
              Open app analysis
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}


