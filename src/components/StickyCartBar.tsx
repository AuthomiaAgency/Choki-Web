import { useApp } from '../context';
import { formatCurrency } from '../utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function StickyCartBar() {
  const { cart, toggleCart } = useApp();
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-30"
        >
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-2">
            <button 
              onClick={toggleCart}
              className="flex-1 flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-colors text-left"
            >
              <div className="bg-primary text-neutral-950 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {totalItems}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Total</span>
                <span className="text-white font-bold font-display">{formatCurrency(totalPrice)}</span>
              </div>
            </button>
            
            <button 
              onClick={toggleCart}
              className="bg-primary text-neutral-950 px-6 py-3 rounded-xl font-bold font-display flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
            >
              Ver Bolsita
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
