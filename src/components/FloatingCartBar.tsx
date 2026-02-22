import React from 'react';
import { useApp } from '../context';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../utils';

export function FloatingCartBar() {
  const { cart, toggleCart, setActiveTab, justAdded, user } = useApp();
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0 || user?.role === 'admin') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-6 z-40"
      >
        <motion.div 
          animate={justAdded ? { scale: [1, 1.02, 1] } : {}}
          className="bg-neutral-900 dark:bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-black/50 flex items-stretch overflow-hidden border border-white/10 dark:border-black/5 h-16 sm:h-20"
        >
          <button 
            onClick={toggleCart}
            className="flex-grow flex items-center gap-3 sm:gap-4 px-4 sm:px-8 hover:bg-white/5 dark:hover:bg-black/5 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">
                <ShoppingBag size={20} sm:size={24} />
              </div>
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-primary text-neutral-950 text-[8px] sm:text-[10px] font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-neutral-900 dark:border-white shadow-lg">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[8px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-[0.2em]">Bolsita</p>
              <p className="text-white dark:text-neutral-900 font-display font-bold text-base sm:text-lg leading-none">{formatCurrency(totalPrice)}</p>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('checkout')}
            className="bg-primary text-neutral-950 px-6 sm:px-10 font-display font-bold flex items-center gap-2 sm:gap-3 hover:bg-primary/90 transition-all active:scale-95 text-sm sm:text-lg"
          >
            <span>Comprar</span>
            <ArrowRight size={18} sm:size={22} strokeWidth={3} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
