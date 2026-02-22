import React from 'react';
import { useApp } from '../context';
import { Tag, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';

export function PromosPage() {
  const { promos, setActiveTab, setHighlightedProductIds } = useApp();
  const activePromos = promos.filter(p => p.active);

  const handleGoToShop = (promo: any) => {
    if (promo.condition?.type === 'product_id' && promo.condition.target) {
      setHighlightedProductIds([promo.condition.target]);
      setTimeout(() => setHighlightedProductIds([]), 3000); // Clear after 3s
    } else if (promo.productIds && promo.productIds.length > 0) {
      setHighlightedProductIds(promo.productIds);
      setTimeout(() => setHighlightedProductIds([]), 3000);
    }
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center gap-4 border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
        <button 
          onClick={() => setActiveTab('home')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white leading-none">ChokiPromos 🎁</h1>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {activePromos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-neutral-300 mb-6">
              <Tag size={40} />
            </div>
            <h2 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-2">No hay promociones activas</h2>
            <p className="text-neutral-500 max-w-[200px]">Vuelve pronto para descubrir ofertas increíbles.</p>
          </div>
        ) : (
          activePromos.map((promo, idx) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-neutral-900 dark:bg-neutral-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group shadow-2xl border border-white/10 dark:border-white/5"
            >
              <div className="absolute -top-10 -right-10 text-primary/10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <Tag size={180} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="text-primary" size={18} fill="currentColor" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Promoción Especial</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">{promo.name}</h2>
                <p className="text-neutral-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-[240px] sm:max-w-md">
                  {promo.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={() => handleGoToShop(promo)}
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-neutral-950 font-display font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                  >
                    Ir a Tienda
                    <ArrowRight size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-display font-bold text-xl sm:text-2xl">
                      {promo.reward?.type === 'discount_percentage' && `-${promo.reward.value}%`}
                      {promo.reward?.type === 'discount_fixed' && `Ahorra ${formatCurrency(promo.reward.value)}`}
                      {promo.reward?.type === 'bonus_points' && `+${promo.reward.value} Puntos`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
