import React from 'react';
import { useApp } from '../context';
import { ArrowLeft, Gift, Star } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';

export function RewardsPage() {
  const { user, products, redeemPoints, setActiveTab } = useApp();
  
  // Products that can be redeemed (cost = price * 100 points)
  const rewardProducts = products.filter(p => p.price <= 2.00);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-200 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-neutral-900 dark:text-white">ChokiPremios 🎁</h1>
      </header>

      <main className="px-6 py-8">
        <div className="bg-primary/10 border-2 border-primary/20 rounded-[2.5rem] p-8 mb-10 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Tus Puntos</p>
            <p className="text-5xl font-display font-bold text-neutral-900 dark:text-white">{user?.points}</p>
          </div>
          <Star className="text-primary/20 absolute -right-4 -bottom-4" size={120} fill="currentColor" />
        </div>

        <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-6">Premios Disponibles</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {rewardProducts.map(p => {
            const cost = p.price * 100;
            const canAfford = (user?.points || 0) >= cost;
            
            return (
              <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 border border-neutral-200 dark:border-white/5 flex gap-6 items-center shadow-sm">
                <img src={p.image} className="w-20 h-20 rounded-2xl object-cover" alt={p.name} />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white leading-tight mb-1">{p.name}</h3>
                  <p className="text-primary font-bold text-sm mb-3">{cost} ChokiPoints</p>
                  <button 
                    disabled={!canAfford}
                    onClick={() => redeemPoints(p)}
                    className={`w-full py-3 rounded-xl font-display font-bold text-xs transition-all ${
                      canAfford 
                        ? 'bg-primary text-neutral-950 shadow-lg shadow-primary/10 active:scale-95' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Canjear Premio' : 'Puntos insuficientes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
