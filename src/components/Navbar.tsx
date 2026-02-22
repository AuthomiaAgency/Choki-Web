import { useApp } from '../context';
import { Home, User, Tag, Package, Store } from 'lucide-react';
import { motion } from 'motion/react';

export function Navbar() {
  const { activeTab, setActiveTab, user } = useApp();

  const clientTabs = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'promos', icon: Tag, label: 'Promos' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const adminTabs = [
    { id: 'admin-orders', icon: Package, label: 'Pedidos' },
    { id: 'admin-shop', icon: Store, label: 'Tienda' },
    { id: 'admin-promos', icon: Tag, label: 'Promos' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const tabs = user?.role === 'admin' ? adminTabs : clientTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-200 dark:border-white/5 pb-safe pt-2 px-6 z-40 transition-colors duration-300">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
            >
              <div className={`relative p-1.5 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-neutral-400 dark:text-neutral-500'}`}>
                <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
