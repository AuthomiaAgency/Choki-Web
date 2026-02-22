import React, { useState } from 'react';
import { useApp } from '../context';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';

export function CheckoutPage() {
  const { cart, setActiveTab, placeOrder, promos } = useApp();
  const [hasPromo, setHasPromo] = useState(false);
  
  // Check if any promo applies
  const applicablePromo = promos.find(p => 
    p.active && 
    p.type === 'bundle' && 
    cart.filter(item => item.price === 1.50).reduce((sum, item) => sum + item.quantity, 0) >= (p.requiredQuantity || 3)
  );

  // Auto-apply if applicable
  React.useEffect(() => {
    if (applicablePromo) {
      setHasPromo(true);
    } else {
      setHasPromo(false);
    }
  }, [applicablePromo]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  
  let discount = 0;
  if (hasPromo && applicablePromo) {
    const comboItems = cart.filter(item => item.price === 1.50);
    const comboCount = comboItems.reduce((sum, item) => sum + item.quantity, 0);
    const bundles = Math.floor(comboCount / (applicablePromo.requiredQuantity || 3));
    discount = ((applicablePromo.requiredQuantity || 3) * 1.50 - applicablePromo.discountedPrice!) * bundles;
  }

  const total = totalPrice + shipping - discount;

  const handleConfirm = () => {
    placeOrder(hasPromo);
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-200 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('home')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-neutral-900 dark:text-white">Finalizar Compra</h1>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Promo Toggle - Only show if applicable */}
        {applicablePromo && (
          <section>
            <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Tag size={20} sm:size={24} />
                </div>
                <div>
                  <p className="font-display font-bold text-neutral-900 dark:text-white text-sm sm:text-base">ChokiPromo Aplicada</p>
                  <p className="text-[10px] sm:text-xs text-neutral-500">¡Estás ahorrando {formatCurrency(discount)}!</p>
                </div>
              </div>
              <button 
                onClick={() => setHasPromo(!hasPromo)}
                className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors relative ${hasPromo ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
              >
                <motion.div 
                  animate={{ x: hasPromo ? 24 : 4 }}
                  className="absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </section>
        )}

        {/* Summary */}
        <section>
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4">Resumen del pedido</h2>
          <div className="bg-white dark:bg-neutral-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-neutral-200 dark:border-white/5 space-y-4 shadow-sm">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-[10px]">
                    {item.quantity}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-4 sm:pt-6 border-t border-neutral-100 dark:border-white/5 space-y-3">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-500 font-bold">
                  <span>Descuento ChokiPromo</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Envío</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white pt-4">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4">Método de pago</h2>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-neutral-900 border-2 border-primary rounded-[1.5rem] sm:rounded-[2rem] text-left shadow-lg shadow-primary/5">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Truck size={20} sm:size={28} />
              </div>
              <div>
                <p className="font-display font-bold text-neutral-900 dark:text-white text-base sm:text-lg">Pago contra entrega</p>
                <p className="text-[10px] sm:text-xs text-neutral-500">Paga al recibir tu pedido</p>
              </div>
            </button>
            <button className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem] text-left opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <CreditCard size={20} sm:size={28} />
              </div>
              <div>
                <p className="font-display font-bold text-neutral-900 dark:text-white text-base sm:text-lg">Tarjeta (Próximamente)</p>
                <p className="text-[10px] sm:text-xs text-neutral-500">Visa, Mastercard, AMEX</p>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-200 dark:border-white/5">
        <button 
          onClick={handleConfirm}
          className="w-full py-4 sm:py-5 bg-primary text-neutral-950 font-display font-bold text-base sm:text-lg rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Confirmar Pedido ({formatCurrency(total)})
        </button>
      </div>
    </div>
  );
}
