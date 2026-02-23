import React, { useState } from 'react';
import { useApp } from '../context';
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, PartyPopper, Tag } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export function OrdersPage() {
  const { user, cancelOrder, hideOrder, setActiveTab } = useApp();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const allOrders = user?.history || [];

  // Filter orders based on user requirements:
  // 1. Cancelled orders disappear.
  // 2. Completed/Paid orders stay for 24 hours.
  // 3. Prepared/Pending orders stay until they change.
  const visibleOrders = allOrders.filter(order => {
    if (order.status === 'cancelled') return false;
    if (order.status === 'completed') {
      const orderDate = new Date(order.date).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    }
    return true;
  });

  // Sort orders: Pending/Prepared first, then Completed
  const sortedOrders = [...visibleOrders].sort((a, b) => {
    const scoreA = a.status === 'pending' || a.status === 'prepared' ? 2 : 1;
    const scoreB = b.status === 'pending' || b.status === 'prepared' ? 2 : 1;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleCancelClick = (orderId: string) => {
    setCancellingId(orderId);
  };

  const confirmCancel = () => {
    if (cancellingId) {
      cancelOrder(cancellingId);
      setCancellingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, text: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'prepared': return { icon: Package, text: 'PREPARADO', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'completed': return { icon: CheckCircle2, text: 'PAGADO', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'cancelled': return { icon: XCircle, text: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      default: return { icon: Clock, text: status, color: 'text-neutral-500', bg: 'bg-neutral-500/10', border: 'border-neutral-500/20' };
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
        <button 
          onClick={() => setActiveTab('home')}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-bold text-neutral-900 dark:text-white leading-none">Mis Pedidos</h1>
      </header>

      <main className="px-4 py-4 space-y-6">
        {sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-500 text-center">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-[1.5rem] flex items-center justify-center mb-4 rotate-6">
              <Package size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-neutral-900 dark:text-white font-display font-bold text-xl mb-1">No hay pedidos aún</h3>
            <p className="text-xs max-w-[200px] font-medium leading-relaxed mb-6">Tus pedidos aparecerán aquí una vez que realices tu primera compra.</p>
            <button 
              onClick={() => setActiveTab('home')}
              className="px-8 py-3 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg shadow-primary/20 text-sm"
            >
              Explorar Choki
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedOrders.map((order, idx) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white dark:bg-neutral-900 rounded-[1.5rem] p-5 border shadow-sm overflow-hidden relative ${
                      order.status === 'completed' ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-neutral-200 dark:border-white/5'
                    }`}
                  >
                    {/* Delete Button (Only for completed/cancelled) */}
                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <button 
                        onClick={() => hideOrder(order.id)}
                        className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 transition-colors p-1"
                        title="Eliminar del historial"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="flex justify-between items-start mb-4 pr-6">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">
                          {order.isRedemption ? 'CANJE' : 'PEDIDO'} #{order.id.slice(-6)}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-medium">
                          {new Date(order.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${status.bg} ${status.border} border`}>
                      <StatusIcon className={status.color} size={18} />
                      <div className="flex-1">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
                          {status.text}
                        </p>
                        {order.status === 'completed' && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <PartyPopper size={12} className="text-emerald-500" />
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              {order.isRedemption 
                                ? `¡Disfruta tu canje! ✨`
                                : `Has recibido ${order.pointsEarned} ChokiPoints por tu compra ✨`
                              }
                            </p>
                          </div>
                        )}
                        {order.status === 'prepared' && (
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
                            Tu pedido está listo para entrega/recogida.
                          </p>
                        )}
                        {order.status === 'cancelled' && order.cancelledBy === 'admin' && (
                          <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                            Perdón {user?.name.split(' ')[0]}, se nos acabó el stock de algunos productos.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400 font-medium">{item.quantity}x {item.name}</span>
                          {order.status !== 'completed' && (
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      ))}
                      {/* Show Discount if exists */}
                      {!order.isRedemption && order.hasPromo && (
                         <div className="mt-3 bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0" />
                            <div className="relative z-10 flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                <Tag size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                                  {order.appliedPromoName}
                                  {order.promoMultiplier && order.promoMultiplier > 1 ? (
                                    <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded-md">
                                      x{order.promoMultiplier}
                                    </span>
                                  ) : order.items.reduce((s, i) => s + i.price * i.quantity, 0) - order.total > 0 ? (
                                    <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded-md">
                                      Aplicado
                                    </span>
                                  ) : null}
                                </p>
                                <p className="text-[9px] text-neutral-500 font-medium">Promo aplicada</p>
                              </div>
                            </div>
                            <span className="relative z-10 text-emerald-500 font-display font-bold text-lg flex flex-col items-end">
                               {order.items.reduce((s, i) => s + i.price * i.quantity, 0) > order.total && (
                                 <span>-{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0) - order.total)}</span>
                               )}
                               {order.pointsEarned - Math.floor(order.total * 10) > 0 && (
                                 <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md mt-1">+{order.pointsEarned - Math.floor(order.total * 10)} Pts</span>
                               )}
                               {order.items.reduce((s, i) => s + i.price * i.quantity, 0) === order.total && order.pointsEarned - Math.floor(order.total * 10) === 0 && (
                                 <span className="text-sm">Aplicado</span>
                               )}
                            </span>
                         </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-end">
                      <div>
                        {order.status === 'completed' ? (
                          <div className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle2 size={24} />
                            <span className="font-display font-bold text-lg">Entregado</span>
                          </div>
                        ) : (
                          !order.isRedemption && (
                            <>
                              <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Puntos</p>
                              <p className="text-emerald-500 font-display font-bold text-sm">+{order.pointsEarned}</p>
                            </>
                          )
                        )}
                      </div>
                      <div className="text-right">
                        {order.status === 'completed' && !order.isRedemption ? (
                          <>
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Puntos Ganados</p>
                            <p className="text-emerald-500 font-display font-bold text-lg">+{order.pointsEarned}</p>
                          </>
                        ) : (
                          order.status !== 'completed' && (
                            <>
                              <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                              <p className="text-lg font-display font-bold text-primary">
                                {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(order.total)}
                              </p>
                            </>
                          )
                        )}
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4">
                        {cancellingId === order.id ? (
                          <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-200 dark:border-red-500/20">
                            <p className="text-red-600 dark:text-red-400 text-[10px] font-bold mb-2 text-center">¿Cancelar pedido?</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={confirmCancel}
                                className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition-colors"
                              >
                                Sí
                              </button>
                              <button 
                                onClick={() => setCancellingId(null)}
                                className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[10px] font-bold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleCancelClick(order.id)}
                            className="w-full py-2 text-red-500 font-bold text-[10px] uppercase tracking-widest border border-red-500/10 rounded-xl hover:bg-red-500/5 transition-all"
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-0.5">Política de cancelación</p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 leading-relaxed font-medium">
                  Si cancelas tu pedido después de 1 hora de haberlo realizado, se te descontarán <span className="font-bold">5 ChokiPoints</span> adicionales como penalidad.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
