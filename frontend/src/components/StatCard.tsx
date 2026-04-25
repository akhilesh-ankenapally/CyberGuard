import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: 'green' | 'yellow' | 'red' | 'blue';
};

function formatValue(value: number) {
  if (!Number.isInteger(value)) {
    return value.toFixed(2);
  }
  return value.toLocaleString();
}

const toneClasses = {
  green: 'from-cyber-green/20 to-cyber-green/5 text-cyber-green',
  yellow: 'from-cyber-yellow/20 to-cyber-yellow/5 text-cyber-yellow',
  red: 'from-cyber-red/20 to-cyber-red/5 text-cyber-red',
  blue: 'from-cyber-blue/20 to-cyber-blue/5 text-cyber-blue',
};

export function StatCard({ title, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-[28px] p-5"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-cyber-muted">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{formatValue(value)}</p>
        </div>
        <p className="max-w-[140px] text-right text-xs leading-5 text-cyber-muted">{hint}</p>
      </div>
    </motion.div>
  );
}


