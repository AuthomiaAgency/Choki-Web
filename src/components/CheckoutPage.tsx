import React, { useState } from 'react';
import { useApp } from '../context';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';

export function CheckoutPage() {
  const { cart, setActiveTab, placeOrder, promos, getAppliedPromo } = useApp();
  
  const appliedPromoData = React.useMemo(() => getAppliedPromo(), [cart, promos, getAppliedPromo]);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedPromoData ? appliedPromoData.savings : 0;
  const total = Math.max(0, totalPrice - discount);

  const isPromoPrice = appliedPromoData?.promo.reward.type === 'promo_price' || (appliedPromoData?.promo.reward.type === 'multi_reward' && appliedPromoData?.promo.reward.promoPrice);
  const promoPriceTotal = isPromoPrice ? (appliedPromoData!.promo.reward.promoPrice || appliedPromoData!.promo.reward.value || 0) * appliedPromoData!.multiplier : 0;

  const handleConfirm = async () => {
    const success = await placeOrder();
    if (success) {
      setActiveTab('orders');
    }
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
              {appliedPromoData && (
                <div className="flex justify-between text-sm text-emerald-500 font-bold items-center">
                  <span className="flex items-center gap-1.5">
                    <Tag size={16} /> 
                    {appliedPromoData.promo.name}
                    {appliedPromoData.multiplier > 1 && (
                      <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-md ml-1">
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
                        {discount > 0 && appliedPromoData.points > 0 && ' / '}
                        {appliedPromoData.points > 0 && `+${appliedPromoData.points} Puntos`}
                        {discount === 0 && appliedPromoData.points === 0 && 'Aplicado'}
                      </>
                    )}
                  </span>
                </div>
              )}
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
