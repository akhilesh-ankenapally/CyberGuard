import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  statusLabel: string;
  icon: ReactNode;
  children: ReactNode;
};

export function ProtectionModuleCard({ title, description, label, active, onToggle, statusLabel, icon, children }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-strong rounded-[30px] p-5 transition ${active ? 'shadow-[0_0_0_1px_rgba(22,163,74,0.2)]' : 'opacity-95'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8D1C7] bg-[#F3EEE7] text-cyber-green">
            {icon}
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">{label}</div>
            <h3 className="mt-1 text-xl font-bold">{title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-cyber-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex min-w-28 items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.25em] transition ${
            active ? 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green' : 'border-[#CEC4B7] bg-[#EAE6DF] text-cyber-muted'
          }`}
        >
          {active ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${active ? 'bg-cyber-green/10 text-cyber-green' : 'bg-[#EAE6DF] text-cyber-muted'}`}>
          {statusLabel}
        </span>
        <span className="rounded-full border border-[#D8D1C7] bg-[#F3EEE7] px-3 py-1 text-[11px] font-semibold text-cyber-muted">
          {active ? 'Monitoring enabled' : 'Protection paused'}
        </span>
      </div>

      <div className="mt-5">{children}</div>
    </motion.article>
  );
}


