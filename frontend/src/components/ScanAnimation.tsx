import { motion } from 'framer-motion';

export function ScanAnimation({ stage }: { stage: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mt-4 rounded-[24px] border border-cyber-green/20 bg-cyber-green/10 p-4"
    >
      <div className="mb-3 text-sm font-semibold text-cyber-green">{stage}</div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-cyber-green via-cyber-blue to-transparent"
        />
      </div>
      <div className="mt-2 text-xs text-cyber-muted">Threat Intelligence Engine processing signal patterns.</div>
    </motion.div>
  );
}


