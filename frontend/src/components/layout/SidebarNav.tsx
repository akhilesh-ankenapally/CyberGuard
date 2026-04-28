import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Settings2, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/protection', label: 'Protection', icon: Shield },
  { to: '/activity', label: 'Permissions', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

export function SidebarNav() {
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-3 mb-3 h-[60px] rounded-[16px] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(135deg,rgba(238,242,255,0.95),rgba(224,231,255,0.9))] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="grid h-full grid-cols-4 gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="block h-full outline-none"
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.96 }} className={`group relative flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl px-2 transition ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,rgba(99,102,241,0.24),rgba(139,92,246,0.2))] text-cyber-text shadow-[0_4px_12px_rgba(99,102,241,0.2)]'
                    : 'text-cyber-muted hover:bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.08))] hover:text-cyber-text'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="truncate text-xs font-medium">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}



