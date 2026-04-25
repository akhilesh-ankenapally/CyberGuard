import { AnimatePresence, motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import { useCyberGuard } from '../../context/CyberGuardContext';

const toneClasses = {
  green: 'border border-cyber-green/20 bg-cyber-green/10 text-cyber-green',
  yellow: 'border border-cyber-yellow/20 bg-cyber-yellow/10 text-cyber-yellow',
  red: 'border border-cyber-red/20 bg-cyber-red/10 text-cyber-red',
  blue: 'border border-cyber-blue/20 bg-cyber-blue/10 text-cyber-blue',
};

export function ToastStack() {
  const { toasts } = useCyberGuard();

  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-40 flex w-[90%] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`pointer-events-auto rounded-[16px] px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ${toneClasses[toast.tone]}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-[#EAE6DF]">
                <BellRing className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-cyber-text">{toast.title}</div>
                <div className="mt-2 line-clamp-2 break-words text-xs font-medium text-cyber-muted">{toast.message}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


