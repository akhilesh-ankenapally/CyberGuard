import { motion } from 'framer-motion';
import { platformMeta, threatPalette } from '../data/platforms';
import { getRelativeTimeLabel } from '../lib/time';
import type { ThreatRecord } from '../types';

type Props = {
  record: ThreatRecord;
  compact?: boolean;
};

export function ThreatCard({ record, compact = false }: Props) {
  const threat = threatPalette[record.risk_level];
  const meta = platformMeta[record.platform];
  const Icon = meta.icon;
  const riskTag = record.risk_level === 'Threat' ? 'High Priority' : record.risk_level === 'Suspicious' ? 'Needs Review' : 'Baseline';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`mb-3 rounded-[24px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 ${compact ? 'p-3' : ''}`}
      style={{ boxShadow: `0 1px 2px rgba(15,23,42,0.06), 0 0 0 1px ${threat.glow}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8D1C7] bg-[#F3EEE7]">
            <Icon className="h-5 w-5" style={{ color: meta.accent }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-cyber-text">{record.platform}</span>
              <span className="text-xs text-cyber-muted">{record.sender}</span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: threat.background, color: threat.foreground }}>
                {record.risk_level}
              </span>
              <span className="rounded-full border border-[#D8D1C7] bg-[#F3EEE7] px-2.5 py-1 text-[11px] font-semibold text-cyber-muted">
                {riskTag}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-cyber-muted">{record.explanation}</p>
          </div>
        </div>
        <div className="text-right text-xs text-cyber-muted">
          <div className="text-sm font-bold text-cyber-text">{record.confidence}%</div>
          <div>confidence</div>
          <div className="mt-1">{getRelativeTimeLabel(record.timestamp)}</div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 rounded-2xl border border-[#D8D1C7] bg-[#F3EEE7] px-3 py-2 text-sm text-cyber-muted">
          {record.message}
        </div>
      )}
    </motion.div>
  );
}


