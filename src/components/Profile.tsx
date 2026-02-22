import { useApp } from '../context';
import { User, Award, History, LogOut, Moon, Sun, Settings, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';

export function Profile() {
  const { user, orders, theme, toggleTheme, logout, setActiveTab, getTotalRevenue } = useApp();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const pointsToNextReward = 150 - (user.points % 150);
  const progress = Math.min(100, (user.points % 150) / 150 * 100);
  const canRedeem = user.points >= 150;
  const revenue = getTotalRevenue();

  return (
    <div className="pb-24 px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="flex flex-col items-center mb-8 sm:mb-10">
        <div className="relative mb-4 sm:mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] p-1 border-4 border-primary/20 bg-white dark:bg-neutral-900 shadow-xl">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full rounded-[1.8rem] sm:rounded-[2rem] object-cover"
            />
          </div>
          {isAdmin && (
            <div className="absolute -bottom-2 -right-2 bg-primary text-neutral-950 px-3 py-1 rounded-full border-4 border-neutral-50 dark:border-neutral-950 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg">
              Admin
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-neutral-900 dark:text-white mb-1">{user.name}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base font-medium">
          {isAdmin ? 'Director de Imperio Choki 👑' : 'Miembro Choki ✨'}
        </p>
      </div>

      {/* ChokiPoints / ChokiIngresos Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 dark:bg-neutral-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-white/10 dark:border-white/5 shadow-2xl mb-8 relative overflow-hidden text-white"
      >
        {/* Medal Background Effect */}
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12 pointer-events-none">
          <Award size={200} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div>
              <p className="text-[9px] sm:text-[10px] text-primary uppercase tracking-[0.3em] font-bold mb-2">
                {isAdmin ? 'ChokiIngresos' : 'ChokiPoints'}
              </p>
              <p className="text-4xl sm:text-7xl font-display font-bold">
                {isAdmin ? formatCurrency(revenue) : user.points}
              </p>
            </div>
            {!isAdmin && canRedeem && (
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('rewards')}
                className="bg-primary text-neutral-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/30 border-2 border-white/20"
              >
                ¡Reclamar!
              </motion.button>
            )}
          </div>

          {!isAdmin && (
            <>
              <div className="mb-3 sm:mb-4 flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60">
                <span>Progreso ChokiPremio</span>
                <span>{pointsToNextReward} pts para el siguiente</span>
              </div>
              
              <div className="h-4 sm:h-6 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full relative overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                >
                  <motion.div 
                    animate={{ x: [-20, 20] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </motion.div>
              </div>
              
              <button 
                onClick={() => setActiveTab('chokistorial')}
                className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline flex items-center gap-2"
              >
                Ver Chokistorial
                <History size={12} />
              </button>
            </>
          )}

          {isAdmin && (
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Completados</p>
                  <p className="text-xl font-display font-bold text-emerald-400">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Cancelados</p>
                  <p className="text-xl font-display font-bold text-red-400">
                    {orders.filter(o => o.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings List */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        <button 
          onClick={() => setActiveTab('settings')}
          className="flex items-center justify-between p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-200 dark:border-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <Settings size={20} className="sm:size-7" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-neutral-900 dark:text-white text-base sm:text-lg">Configuración</p>
              <p className="text-[10px] sm:text-xs text-neutral-500">Personaliza tu perfil y seguridad</p>
            </div>
          </div>
        </button>
      </div>

      <button 
        onClick={logout}
        className="w-full py-4 sm:py-5 text-red-500 font-display font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:bg-red-500/5 rounded-[1.5rem] sm:rounded-[2rem] transition-all active:scale-95"
      >
        <LogOut size={20} className="sm:size-6" />
        Cerrar Sesión
      </button>
    </div>
  );
}
