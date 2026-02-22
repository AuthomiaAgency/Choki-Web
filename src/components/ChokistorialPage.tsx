import React from 'react';
import { useApp } from '../context';
import { ArrowLeft, History, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ChokistorialPage() {
  const { user, setActiveTab } = useApp();
  const history = user?.pointHistory || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'earned': return <PlusCircle className="text-emerald-500" size={20} />;
      case 'spent': return <MinusCircle className="text-amber-500" size={20} />;
      case 'penalty': return <AlertCircle className="text-red-500" size={20} />;
      default: return <History className="text-neutral-500" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-200 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-neutral-900 dark:text-white">Chokistorial</h1>
      </header>

      <main className="px-6 py-8">
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-white/5 shadow-sm">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-6">Últimos movimientos</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto text-neutral-300 dark:text-neutral-700 mb-4" size={48} />
              <p className="text-neutral-500 font-medium">Aún no tienes movimientos de ChokiPoints.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.slice(0, 10).map((tx, idx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{tx.description}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        {new Date(tx.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-display font-bold text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
