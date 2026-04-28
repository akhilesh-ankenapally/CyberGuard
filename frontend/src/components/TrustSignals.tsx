import { motion } from 'framer-motion';
import { BrainCircuit, Gauge, Shield } from 'lucide-react';
import { formatUpdatedNow } from '../lib/time';

const cards = [
  {
    label: 'Threat Intelligence Engine',
    value: 'AI Model v2.4',
    icon: BrainCircuit,
    tone: 'text-cyber-green',
  },
  {
    label: 'Detection Accuracy',
    value: '98.7%',
    icon: Gauge,
    tone: 'text-cyber-yellow',
  },
  {
    label: 'Secure Network Status',
    value: 'Protected',
    icon: Shield,
    tone: 'text-cyber-blue',
  },
] as const;

export function TrustSignals() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            className="rounded-2xl border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center justify-between text-xs text-cyber-muted">
              <span>{card.label}</span>
              <Icon className={`h-4 w-4 ${card.tone}`} />
            </div>
            <div className={`mt-2 text-base font-semibold ${card.tone}`}>{card.value}</div>
            <div className="mt-1 text-[11px] text-cyber-muted">{formatUpdatedNow()}</div>
          </motion.div>
        );
      })}
    </div>
  );
}


