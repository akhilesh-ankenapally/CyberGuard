import { motion } from 'framer-motion';
import { platformMeta } from '../data/platforms';
import type { Platform } from '../types';

type Props = {
  platform: Platform;
  selected: boolean;
  label?: string;
  onClick: () => void;
};

export function PlatformBadge({ platform, selected, label, onClick }: Props) {
  const meta = platformMeta[platform];
  const Icon = meta.icon;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        selected ? 'border-[rgba(99,102,241,0.25)] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))] text-cyber-text' : 'border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] text-cyber-muted hover:bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] hover:text-cyber-text'
      }`}
      style={selected ? { boxShadow: `0 8px 18px ${meta.accent}20` } : undefined}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: meta.accent }} />
      {label || platform}
    </motion.button>
  );
}


