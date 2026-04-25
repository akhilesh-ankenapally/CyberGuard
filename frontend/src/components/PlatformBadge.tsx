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
        selected ? 'border-[#CEC4B7] bg-[#EAE6DF] text-cyber-text' : 'border-[#D8D1C7] bg-[#FAF8F5] text-cyber-muted hover:bg-[#F3EEE7] hover:text-cyber-text'
      }`}
      style={selected ? { boxShadow: `0 8px 18px ${meta.accent}20` } : undefined}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: meta.accent }} />
      {label || platform}
    </motion.button>
  );
}


