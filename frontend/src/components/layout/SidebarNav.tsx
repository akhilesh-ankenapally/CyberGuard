import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/protection', label: 'Protection', icon: Shield },
  { to: '/activity', label: 'Permissions', icon: Activity },
];

export function SidebarNav() {
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-3 mb-3 h-[60px] rounded-[16px] bg-[#E5E1DA] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="grid h-full grid-cols-3 gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="outline-none"
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.96 }} className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-2 transition ${
                  isActive
                    ? 'bg-cyber-blue/15 text-cyber-text shadow-[0_4px_12px_rgba(79,70,229,0.14)]'
                    : 'text-cyber-muted hover:bg-[#DCD6CD] hover:text-cyber-text'
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



