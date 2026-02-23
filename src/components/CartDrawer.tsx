import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context';
import { ShoppingBag, X, Minus, Plus, CreditCard, Tag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils';
import confetti from 'canvas-confetti';
import { useState, useMemo } from 'react';

export function CartDrawer() {
  const { isCartOpen, toggleCart, cart, updateCartQuantity, placeOrder, promos, setActiveTab, getAppliedPromo } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const appliedPromoData = useMemo(() => getAppliedPromo(), [cart, promos, getAppliedPromo]);

  const discount = appliedPromoData ? appliedPromoData.savings : 0;
  const extraPoints = appliedPromoData ? appliedPromoData.points : 0;
  const promoName = appliedPromoData ? appliedPromoData.promo.name : '';
  const total = Math.max(0, subtotal - discount);

  const isPromoPrice = appliedPromoData?.promo.reward.type === 'promo_price' || (appliedPromoData?.promo.reward.type === 'multi_reward' && appliedPromoData?.promo.reward.promoPrice);
  const promoPriceTotal = isPromoPrice ? (appliedPromoData!.promo.reward.promoPrice || appliedPromoData!.promo.reward.value || 0) * appliedPromoData!.multiplier : 0;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Pass promo info if needed, or just the fact that a promo was applied
    await placeOrder(); 
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f4af25', '#ffffff', '#1a1611']
    });
    
    setIsProcessing(false);
    toggleCart(); // Close cart
    setActiveTab('orders'); // Redirect to orders
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-neutral-900 rounded-t-[2.5rem] z-50 flex flex-col border-t border-white/10 shadow-2xl"
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={toggleCart}>
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h2 className="text-2xl font-display font-bold text-primary">Tu Bolsita</h2>
              <button onClick={toggleCart} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
                  <ShoppingBag size={64} strokeWidth={1} />
                  <p className="text-lg">Tu bolsita está vacía</p>
                  <button onClick={toggleCart} className="text-primary font-medium hover:underline flex items-center gap-2">
                    Ir a comprar <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <motion.div 
                      layout
                      key={item.id} 
                      className="flex gap-4 bg-neutral-800/50 p-3 rounded-2xl border border-white/5"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-display font-bold text-white">{item.name}</h3>
                          <p className="text-primary font-bold">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-neutral-900/50 w-fit px-2 py-1 rounded-lg border border-white/5">
                          <button 
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Applied Promo Indicator */}
                  {appliedPromoData && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-primary/20 to-emerald-500/20 border-2 border-primary/30 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-primary/5 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 rotate-3">
                          <Tag size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-primary font-display font-bold text-lg leading-tight">{promoName}</p>
                          <p className="text-xs text-neutral-300 font-medium">¡Promoción aplicada!</p>
                          {extraPoints > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-lg w-fit border border-emerald-500/20">
                              <Plus size={10} />
                              {extraPoints} Puntos Extra
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative z-10 text-right">
                        {isPromoPrice ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Precio Promo</span>
                            <span className="text-2xl font-display font-bold text-emerald-400 drop-shadow-sm">{formatCurrency(promoPriceTotal)}</span>
                            {discount > 0 && <span className="text-[10px] text-emerald-500 font-bold mt-1">Ahorras {formatCurrency(discount)}</span>}
                            {extraPoints > 0 && <span className="bg-primary text-neutral-950 px-3 py-1 rounded-lg font-bold text-xs shadow-lg shadow-primary/20 mt-1">+{extraPoints} Pts</span>}
                          </div>
                        ) : (discount > 0 || extraPoints > 0) ? (
                          <div className="flex flex-col items-end">
                            {discount > 0 && <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Ahorras</span>}
                            {discount > 0 && <span className="text-2xl font-display font-bold text-emerald-400 drop-shadow-sm">-{formatCurrency(discount)}</span>}
                            {extraPoints > 0 && <span className="bg-primary text-neutral-950 px-3 py-1 rounded-lg font-bold text-xs shadow-lg shadow-primary/20 mt-1">+{extraPoints} Pts</span>}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-neutral-900 border-t border-white/10 pb-10">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-neutral-400 text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedPromoData && (
                    <div className="flex justify-between items-center text-primary text-sm font-bold">
                      <span className="flex items-center gap-1.5">
                        {appliedPromoData.promo.name}
                        {appliedPromoData.multiplier > 1 && (
                          <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded-md">
                            x{appliedPromoData.multiplier}
                          </span>
                        )}
                      </span>
                      <span>
                        {isPromoPrice ? (
                          <span className="text-emerald-400 font-bold">{formatCurrency(promoPriceTotal)}</span>
                        ) : (
                          <>
                            {discount > 0 && `-${formatCurrency(discount)}`}
                            {discount > 0 && extraPoints > 0 && ' / '}
                            {extraPoints > 0 && `+${extraPoints} Pts`}
                            {discount === 0 && extraPoints === 0 && 'Aplicado'}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-white font-bold">Total a pagar</span>
                    <span className="text-3xl font-display font-bold text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-2xl text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
