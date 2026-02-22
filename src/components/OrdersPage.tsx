import React, { useState } from 'react';
import { useApp } from '../context';
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion } from 'motion/react';

export function OrdersPage() {
  const { user, cancelOrder, setActiveTab } = useApp();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const allOrders = user?.history || [];
  const notifications = user?.notifications || [];

  // Filter out expired notifications
  const activeNotifications = notifications.filter(n => new Date(n.expiresAt) > new Date());

  const activeOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'prepared');
  const pastOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'cancelled').slice(0, 7);

  const handleCancelClick = (orderId: string) => {
    setCancellingId(orderId);
  };

  const confirmCancel = () => {
    if (cancellingId) {
      cancelOrder(cancellingId);
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={14} />;
      case 'prepared': return <Package className="text-blue-500" size={14} />;
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={14} />;
      case 'cancelled': return <XCircle className="text-red-500" size={14} />;
      default: return <Clock className="text-neutral-500" size={14} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'prepared': return 'PREPARADO';
      case 'completed': return 'PAGADO';
      case 'cancelled': return 'Cancelado';
      default: return status;
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
        {/* Notifications */}
        {activeNotifications.length > 0 && (
          <div className="space-y-2">
            {activeNotifications.map(n => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="bg-primary text-neutral-950 p-1.5 rounded-lg">
                  <Package size={16} />
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{n.message}</p>
              </motion.div>
            ))}
          </div>
        )}

        {allOrders.length === 0 ? (
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
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pedidos en curso</h2>
                {activeOrders.map((order, idx) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-neutral-900 rounded-[1.5rem] p-5 border border-neutral-200 dark:border-white/5 shadow-sm overflow-hidden relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">
                          {order.isRedemption ? 'CANJE' : 'PEDIDO'} #{order.id.slice(-6)}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-medium">
                          {new Date(order.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        order.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        order.status === 'prepared' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        order.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        'bg-red-500/10 border-red-500/20 text-red-500'
                      }`}>
                        {getStatusIcon(order.status)}
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400 font-medium">{item.quantity}x {item.name}</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-end">
                      <div>
                        {!order.isRedemption && (
                          <>
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Puntos</p>
                            <p className="text-emerald-500 font-display font-bold text-sm">+{order.pointsEarned}</p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                        <p className="text-lg font-display font-bold text-primary">
                          {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(order.total)}
                        </p>
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
                                className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold"
                              >
                                Sí
                              </button>
                              <button 
                                onClick={() => setCancellingId(null)}
                                className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[10px] font-bold"
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
                ))}
              </section>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Historial Reciente (7)</h2>
                <div className="space-y-2">
                  {pastOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-200 dark:border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-display font-bold text-neutral-900 dark:text-white text-xs">
                          {order.status === 'cancelled' ? `Has cancelado el pedido #${order.id.slice(-6)}` : `Pedido #${order.id.slice(-6)}`}
                        </p>
                        <p className="text-[9px] text-neutral-500">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-neutral-900 dark:text-white text-xs">
                          {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(order.total)}
                        </p>
                        <p className={`text-[9px] font-bold uppercase ${order.status === 'completed' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {order.status === 'completed' ? 'PAGADO' : 'Cancelado'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
