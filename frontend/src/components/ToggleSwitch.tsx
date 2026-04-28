import { motion } from 'framer-motion';

type ToggleSwitchProps = {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
};

export function ToggleSwitch({ checked, onChange, ariaLabel = 'Toggle setting' }: ToggleSwitchProps) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.24, ease: 'easeInOut' }}
      aria-label={ariaLabel}
      aria-pressed={checked}
      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full p-0"
    >
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full px-1 transition-all duration-300 ease-in-out ${
          checked
            ? 'justify-end bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#3B82F6] shadow-[0_8px_16px_rgba(99,102,241,0.28)]'
            : 'justify-start bg-slate-300/90'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full transition-all duration-300 ease-in-out ${
            checked ? 'bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))]' : 'border border-slate-400 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))]'
          }`}
        />
      </span>
    </motion.button>
  );
}



