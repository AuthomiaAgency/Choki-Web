import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { formatCurrency } from '../utils';
import { CheckCircle, XCircle, Clock, DollarSign, Package, Plus, Edit2, Trash2, Tag, Store, History, Save, X, Image as ImageIcon, List, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Promo, Order } from '../types';
import { toast } from 'sonner';

export function AdminPanel() {
  const { 
    products, orders, promos, updateOrderStatus, activeTab, setActiveTab,
    addProduct, updateProduct, deleteProduct, addPromo, updatePromo, deletePromo
  } = useApp();
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [editingPromo, setEditingPromo] = useState<Partial<Promo> | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'prepared');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const prevOrdersRef = useRef(orders);

  // Handle cancelled orders notification
  useEffect(() => {
    const prevOrders = prevOrdersRef.current;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    
    // Find orders that were NOT cancelled before but are now
    const newCancelled = cancelledOrders.filter(o => {
      const prev = prevOrders.find(p => p.id === o.id);
      return prev && prev.status !== 'cancelled';
    });

    newCancelled.forEach(o => {
      toast.error(`El pedido #${o.id.slice(-6)} ha sido cancelado por el cliente`, {
        duration: 5000,
        icon: <XCircle size={18} />
      });
    });

    prevOrdersRef.current = orders;
  }, [orders]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct(editingProduct as Omit<Product, 'id'>);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;

    if (editingPromo.id) {
      updatePromo(editingPromo.id, editingPromo);
    } else {
      addPromo(editingPromo as Omit<Promo, 'id'>);
    }
    setIsPromoModalOpen(false);
    setEditingPromo(null);
  };

  const openProductModal = (product?: Product) => {
    setEditingProduct(product || {
      name: '',
      description: '',
      price: 0,
      points: 0,
      image: '',
      ingredients: [],
      stock: 0
    });
    setIsProductModalOpen(true);
  };

  const openPromoModal = (promo?: Promo) => {
    const defaultCondition: any = { type: 'product_id', threshold: 1, target: '' };
    const defaultReward: any = { type: 'discount_percentage', value: 10 };

    setEditingPromo(promo ? {
      ...promo,
      condition: promo.condition || defaultCondition,
      reward: promo.reward || defaultReward
    } : {
      name: '',
      description: '',
      active: true,
      isFeatured: false,
      condition: defaultCondition,
      reward: defaultReward,
      productIds: []
    });
    setIsPromoModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev!, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProductModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 w-full max-w-lg rounded-[2rem] border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold">{editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Nombre</label>
            <input 
              type="text" 
              value={editingProduct?.name} 
              onChange={e => setEditingProduct(prev => ({ ...prev!, name: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Precio (S/)</label>
              <input 
                type="number" 
                step="0.1"
                value={editingProduct?.price} 
                onChange={e => setEditingProduct(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Puntos</label>
              <input 
                type="number" 
                value={editingProduct?.points} 
                onChange={e => setEditingProduct(prev => ({ ...prev!, points: parseInt(e.target.value) }))}
                className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Descripción</label>
            <textarea 
              value={editingProduct?.description} 
              onChange={e => setEditingProduct(prev => ({ ...prev!, description: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none h-24"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Imagen</label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <label className="flex-1 cursor-pointer bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-xl p-3 border border-white/5 border-dashed flex items-center justify-center gap-2">
                  <Upload size={18} className="text-neutral-400" />
                  <span className="text-sm text-neutral-400 font-medium">Subir desde Galería</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              
              {editingProduct?.image && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-800 border border-white/5">
                  <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(prev => ({ ...prev!, image: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Stock</label>
            <input 
              type="number" 
              value={editingProduct?.stock} 
              onChange={e => setEditingProduct(prev => ({ ...prev!, stock: parseInt(e.target.value) }))}
              className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none"
              required
            />
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
            Guardar Producto
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderPromoModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 w-full max-w-lg rounded-[2rem] border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold">{editingPromo?.id ? 'Editar Promo' : 'Nueva Promo'}</h3>
          <button onClick={() => setIsPromoModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSavePromo} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Nombre</label>
            <input 
              type="text" 
              value={editingPromo?.name} 
              onChange={e => setEditingPromo(prev => ({ ...prev!, name: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Descripción</label>
            <textarea 
              value={editingPromo?.description} 
              onChange={e => setEditingPromo(prev => ({ ...prev!, description: e.target.value }))}
              className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none h-20"
              required
            />
          </div>
          
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-primary">Condición</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Si compra...</label>
                <select 
                  value={editingPromo?.condition?.type}
                  onChange={e => setEditingPromo(prev => ({ 
                    ...prev!, 
                    condition: { ...prev!.condition!, type: e.target.value as any } 
                  }))}
                  className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                >
                  <option value="product_id">Producto Específico</option>
                  <option value="min_total">Monto Mínimo</option>
                  <option value="min_quantity">Cantidad Mínima</option>
                </select>
              </div>
              
              {editingPromo?.condition?.type === 'product_id' && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Producto</label>
                  <select 
                    value={editingPromo?.condition?.target}
                    onChange={e => setEditingPromo(prev => ({ 
                      ...prev!, 
                      condition: { ...prev!.condition!, target: e.target.value } 
                    }))}
                    className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">
                {editingPromo?.condition?.type === 'min_total' ? 'Monto (S/)' : 'Cantidad (unidades)'}
              </label>
              <input 
                type="number" 
                value={editingPromo?.condition?.threshold || ''} 
                onChange={e => setEditingPromo(prev => ({ 
                  ...prev!, 
                  condition: { ...prev!.condition!, threshold: parseFloat(e.target.value) || 0 } 
                }))}
                className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
              />
            </div>
          </div>

          <div className="p-4 bg-neutral-800/50 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-emerald-500">Recompensa</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Tipo</label>
                <select 
                  value={editingPromo?.reward?.type}
                  onChange={e => setEditingPromo(prev => ({ 
                    ...prev!, 
                    reward: { ...prev!.reward!, type: e.target.value as any } 
                  }))}
                  className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                >
                  <option value="discount_percentage">Descuento %</option>
                  <option value="discount_fixed">Descuento Fijo (S/)</option>
                  <option value="bonus_points">Puntos Extra</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Valor</label>
                <input 
                  type="number" 
                  value={editingPromo?.reward?.value || ''} 
                  onChange={e => setEditingPromo(prev => ({ 
                    ...prev!, 
                    reward: { ...prev!.reward!, value: parseFloat(e.target.value) || 0 } 
                  }))}
                  className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl border border-white/5">
            <input 
              type="checkbox" 
              checked={editingPromo?.isFeatured} 
              onChange={e => setEditingPromo(prev => ({ ...prev!, isFeatured: e.target.checked }))}
              className="w-5 h-5 accent-primary"
            />
            <label className="text-sm font-bold">Destacado en Tienda</label>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl border border-white/5">
            <input 
              type="checkbox" 
              checked={editingPromo?.active} 
              onChange={e => setEditingPromo(prev => ({ ...prev!, active: e.target.checked }))}
              className="w-5 h-5 accent-primary"
            />
            <label className="text-sm font-bold">Promo Activa</label>
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
            Guardar Promo
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderShop = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Productos</h2>
          <p className="text-neutral-500 text-[10px] mt-0.5">Gestiona tu catálogo</p>
        </div>
        <button 
          onClick={() => openProductModal()}
          className="bg-primary text-neutral-950 px-4 py-2 rounded-xl font-display font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-neutral-900 border border-white/5 rounded-[1.5rem] p-4 flex gap-4 hover:border-white/10 transition-colors">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-display font-bold text-sm leading-tight">{p.name}</h3>
                  <span className="text-primary font-bold text-sm">{formatCurrency(p.price)}</span>
                </div>
                <p className="text-neutral-500 text-[10px] line-clamp-1 mt-1">{p.category}</p>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => openProductModal(p)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => deleteProduct(p.id)}
                  className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPromos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Promociones</h2>
          <p className="text-neutral-500 text-[10px] mt-0.5">Configura ofertas</p>
        </div>
        <button 
          onClick={() => openPromoModal()}
          className="bg-primary text-neutral-950 px-4 py-2 rounded-xl font-display font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Nueva
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {promos.map(p => (
          <div key={p.id} className="bg-neutral-900 border border-white/5 rounded-[1.5rem] p-4 flex justify-between items-center gap-4">
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-500'}`}>
                <Tag size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">{p.name}</h3>
                <p className="text-neutral-500 text-[10px]">{p.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openPromoModal(p)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => deletePromo(p.id)}
                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center font-bold text-sm">
            {activeOrders.length}
          </div>
          <h2 className="text-xl font-display font-bold">Pedidos Activos</h2>
        </div>
        
        <div className="space-y-3">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">
                    {order.isRedemption ? 'CANJE' : 'PEDIDO'} #{order.id.slice(-6)}
                  </p>
                  <h3 className="text-lg font-display font-bold">{order.userName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-primary">
                    {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(order.total)}
                  </p>
                  {order.hasPromo && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Promo</span>}
                </div>
              </div>

              <div className="space-y-1 mb-6">
                {order.items.map((item, idx) => {
                  const productExists = products.some(p => p.id === item.id);
                  return (
                    <div key={`${item.id}-${idx}`} className="flex justify-between text-xs text-neutral-400">
                      <span className={productExists ? "" : "text-red-500 font-bold"}>
                        {item.quantity}x {item.name} {!productExists && "(ELIMINADO)"}
                      </span>
                      <span>
                        {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-4">
                {order.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'prepared')}
                      className="flex-1 py-3 bg-blue-500 text-white font-display font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all text-sm"
                    >
                      Marcar Preparado
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-3 bg-red-500/10 text-red-500 font-display font-bold rounded-xl hover:bg-red-500/20 active:scale-95 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {order.status === 'prepared' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="flex-1 py-3 bg-emerald-500 text-white font-display font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all text-sm"
                  >
                    Marcar Pagado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="opacity-60">
        <h2 className="text-lg font-display font-bold mb-4">Historial Reciente</h2>
        <div className="space-y-2">
          {pastOrders.slice(0, 5).map(order => (
            <div key={order.id} className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{order.userName}</p>
                <p className="text-[10px] text-neutral-500">
                  {order.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                </p>
              </div>
              <p className="font-bold text-sm">{formatCurrency(order.total)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-32">
      <header className="px-6 py-6 border-b border-white/5">
        <h1 className="text-2xl font-display font-bold mb-1">Panel Admin ⚡️</h1>
        <p className="text-neutral-500 text-xs font-medium">Gestiona tu imperio Choki</p>
      </header>

      <main className="p-6">
        {(activeTab === 'admin-shop' || activeTab === 'home') && renderShop()}
        {activeTab === 'admin-promos' && renderPromos()}
        {activeTab === 'admin-orders' && renderOrders()}
      </main>

      <AnimatePresence>
        {isProductModalOpen && renderProductModal()}
        {isPromoModalOpen && renderPromoModal()}
      </AnimatePresence>
    </div>
  );
}
