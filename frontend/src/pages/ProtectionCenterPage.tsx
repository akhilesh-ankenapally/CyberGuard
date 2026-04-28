import { motion } from 'framer-motion';
import { AppWindow, Globe2, PhoneCall, Smartphone } from 'lucide-react';
import { ToggleSwitch } from '../components';
import { useCyberGuard } from '../context/CyberGuardContext';
import { protectionModules } from '../data/protectionCenter';
import type { ProtectionModuleKey } from '../types';

const moduleIcons: Record<ProtectionModuleKey, React.ComponentType<{ className?: string }>> = {
  sms: Smartphone,
  call: PhoneCall,
  app: AppWindow,
  web: Globe2,
};

const moduleAccentGlow: Record<ProtectionModuleKey, string> = {
  sms: '0 8px 18px rgba(37,99,235,0.12)',
  call: '0 8px 18px rgba(202,138,4,0.12)',
  app: '0 8px 18px rgba(22,163,74,0.12)',
  web: '0 8px 18px rgba(220,38,38,0.12)',
};

const moduleIconColorClass: Record<ProtectionModuleKey, string> = {
  sms: 'text-cyber-blue',
  call: 'text-cyber-yellow',
  app: 'text-cyber-green',
  web: 'text-cyber-red',
};

export function ProtectionCenterPage() {
  const { protectionModules: moduleStates, toggleProtectionModule } = useCyberGuard();

  const modules = (Object.keys(protectionModules) as ProtectionModuleKey[]).map((key) => ({
    key,
    content: protectionModules[key],
    state: moduleStates[key],
    Icon: moduleIcons[key],
  }));

  return (
    <div className="flex flex-col gap-3 py-4">
      <section className="rounded-[16px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-cyber-text">Protection Modules</p>
          <span className="rounded-full bg-cyber-green/12 px-3 py-2 text-xs font-medium text-cyber-green">Live</span>
        </div>
        <p className="mt-2 line-clamp-2 break-words text-sm font-medium text-cyber-muted">Toggle shields instantly. Changes apply without leaving the page.</p>
      </section>

      <div className="flex flex-col gap-3">
        {modules.map(({ key, content, state, Icon }) => (
          <motion.article
            key={key}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[16px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-4 text-left shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))]" style={{ boxShadow: moduleAccentGlow[key] }}>
                    <Icon className={`h-5 w-5 ${moduleIconColorClass[key]}`} />
                  </span>
                  <p className="truncate text-base font-semibold text-cyber-text">{content.title}</p>
                </div>
                <p className="mt-2 truncate text-sm font-medium text-cyber-muted">{content.description}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <ToggleSwitch
                  checked={state.enabled}
                  onChange={() => toggleProtectionModule(key)}
                  ariaLabel={`Toggle ${content.title}`}
                />
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${state.enabled ? 'bg-cyber-green/12 text-cyber-green' : 'bg-cyber-red/12 text-cyber-red'}`}>
                  {state.enabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}



