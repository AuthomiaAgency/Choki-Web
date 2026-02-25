import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { formatCurrency } from '../utils';
import { CheckCircle, XCircle, Clock, DollarSign, Package, Plus, Edit2, Trash2, Tag, Store, History, Save, X, Image as ImageIcon, List, Upload, PieChart as PieChartIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Promo, Order } from '../types';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function AdminPanel() {
  const { 
    products, orders, promos, updateOrderStatus, activeTab, setActiveTab,
    addProduct, updateProduct, deleteProduct, addPromo, updatePromo, deletePromo,
    getSectorizedSales, deleteOrder, advancedConfig, updateAdvancedConfig
  } = useApp();
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [editingPromo, setEditingPromo] = useState<Partial<Promo> | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const activeOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'prepared'
  );
  // Filter for statistics: Completed orders only (paid)
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  // Prepare data for Pie Chart
  const salesData = getSectorizedSales();
  const pieData: { name: string; value: number }[] = Object.entries(salesData).map(([name, value]) => ({ name, value: value as number }));
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

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

  // ... (existing handlers: handleSaveProduct, handleSavePromo, openProductModal, openPromoModal, handleImageUpload)

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
      ingredients: []
    });
    setIsProductModalOpen(true);
  };

  const openPromoModal = (promo?: Promo) => {
    const defaultCondition: any = { type: 'product_id', threshold: 1, target: '', targets: [] };
    const defaultReward: any = { type: 'discount_percentage', value: 10, promoPrice: 0, discountAmount: 0, extraPoints: 0 };

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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to save space
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setEditingProduct(prev => ({ ...prev!, image: dataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // ... (renderProductModal and renderPromoModal remain unchanged)
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
                  <option value="product_list">Lista de Productos</option>
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

              {editingPromo?.condition?.type === 'product_list' && (
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Seleccionar Productos</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-neutral-900 rounded-xl border border-white/5">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-[10px]">
                        <input 
                          type="checkbox"
                          checked={editingPromo?.condition?.targets?.includes(p.id)}
                          onChange={e => {
                            const targets = editingPromo?.condition?.targets || [];
                            const newTargets = e.target.checked 
                              ? [...targets, p.id]
                              : targets.filter(id => id !== p.id);
                            setEditingPromo(prev => ({
                              ...prev!,
                              condition: { ...prev!.condition!, targets: newTargets }
                            }));
                          }}
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
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
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Tipo de Recompensa</label>
                <select 
                  value={editingPromo?.reward?.type}
                  onChange={e => setEditingPromo(prev => ({ 
                    ...prev!, 
                    reward: { ...prev!.reward!, type: e.target.value as any, value: 0, promoPrice: 0, discountAmount: 0, extraPoints: 0 } 
                  }))}
                  className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                >
                  <option value="discount_percentage">Descuento Porcentual (%)</option>
                  <option value="discount_fixed">Descuento Fijo (S/)</option>
                  <option value="bonus_points">Puntos Extra</option>
                  <option value="promo_price">Precio Fijo Promocional</option>
                  <option value="multi_reward">Recompensa Múltiple (Desc + Puntos)</option>
                </select>
              </div>
              
              {editingPromo?.reward?.type === 'discount_percentage' && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Porcentaje de Descuento (%)</label>
                  <input 
                    type="number" 
                    value={editingPromo?.reward?.value || ''} 
                    onChange={e => setEditingPromo(prev => ({ 
                      ...prev!, 
                      reward: { ...prev!.reward!, value: parseFloat(e.target.value) || 0 } 
                    }))}
                    className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                    placeholder="Ej: 20"
                  />
                </div>
              )}

              {editingPromo?.reward?.type === 'discount_fixed' && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Monto a Descontar (S/)</label>
                  <input 
                    type="number" 
                    value={editingPromo?.reward?.value || ''} 
                    onChange={e => setEditingPromo(prev => ({ 
                      ...prev!, 
                      reward: { ...prev!.reward!, value: parseFloat(e.target.value) || 0 } 
                    }))}
                    className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                    placeholder="Ej: 5.00"
                  />
                </div>
              )}

              {editingPromo?.reward?.type === 'bonus_points' && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Puntos de Regalo</label>
                  <input 
                    type="number" 
                    value={editingPromo?.reward?.value || ''} 
                    onChange={e => setEditingPromo(prev => ({ 
                      ...prev!, 
                      reward: { ...prev!.reward!, value: parseFloat(e.target.value) || 0 } 
                    }))}
                    className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                    placeholder="Ej: 100"
                  />
                </div>
              )}

              {editingPromo?.reward?.type === 'promo_price' && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Precio Final de la Promo (S/)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editingPromo?.reward?.promoPrice || ''} 
                    onChange={e => setEditingPromo(prev => ({ 
                      ...prev!, 
                      reward: { ...prev!.reward!, promoPrice: parseFloat(e.target.value) || 0 } 
                    }))}
                    className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                    placeholder="Ej: 9.90"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1">El cliente pagará este precio exacto por los productos seleccionados.</p>
                </div>
              )}

              {editingPromo?.reward?.type === 'multi_reward' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Descuento (S/)</label>
                    <input 
                      type="number" 
                      value={editingPromo?.reward?.discountAmount || ''} 
                      onChange={e => setEditingPromo(prev => ({ 
                        ...prev!, 
                        reward: { ...prev!.reward!, discountAmount: parseFloat(e.target.value) || 0 } 
                      }))}
                      className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Puntos Extra</label>
                    <input 
                      type="number" 
                      value={editingPromo?.reward?.extraPoints || ''} 
                      onChange={e => setEditingPromo(prev => ({ 
                        ...prev!, 
                        reward: { ...prev!.reward!, extraPoints: parseFloat(e.target.value) || 0 } 
                      }))}
                      className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                      placeholder="0"
                    />
                  </div>
                  {editingPromo?.condition?.type === 'product_id' && (
                     <div className="col-span-2">
                        <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">O Precio Fijo (Opcional)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={editingPromo?.reward?.promoPrice || ''} 
                          onChange={e => setEditingPromo(prev => ({ 
                            ...prev!, 
                            reward: { ...prev!.reward!, promoPrice: parseFloat(e.target.value) || 0 } 
                          }))}
                          className="w-full bg-neutral-800 rounded-xl p-2 border border-white/5 text-sm"
                          placeholder="Si se llena, ignora el descuento fijo"
                        />
                     </div>
                  )}
                </div>
              )}
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

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Section */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-primary" />
            Ventas por Producto
          </h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                No hay datos de ventas aún
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-neutral-400 truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product List Section */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <List size={20} className="text-emerald-500" />
            Detalle de Ventas
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {pieData.length > 0 ? pieData.sort((a, b) => b.value - a.value).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-neutral-300">{item.name}</span>
                <span className="text-sm font-bold text-white bg-white/10 px-2 py-1 rounded-lg">{item.value} unid.</span>
              </div>
            )) : (
              <div className="text-center text-neutral-500 text-sm py-8">
                No hay productos vendidos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Orders List */}
      <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6">
        <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-blue-500" />
          Pedidos Completados (Ingresos)
        </h3>
        <div className="space-y-3">
          {completedOrders.length > 0 ? completedOrders.slice(0, 10).map(order => (
            <div key={order.id} className="flex justify-between items-center p-4 bg-neutral-800/30 rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-sm text-white">{order.userName}</p>
                <p className="text-[10px] text-neutral-500">
                  {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{formatCurrency(order.total)}</p>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-[10px] text-emerald-500">Pagado</p>
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="p-1 text-neutral-600 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-neutral-500 text-sm py-8">
              No hay pedidos completados
            </div>
          )}
        </div>
      </div>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold">Pedidos Activos</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Activos</span>
            <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-display font-bold text-sm border border-amber-500/20 shadow-lg shadow-amber-500/5">
              {activeOrders.length}
            </div>
          </div>
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
                    {order.hasPromo && !order.isRedemption ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-neutral-500 line-through decoration-red-500/50 decoration-2">
                          {formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                        </span>
                        <p className="text-xl font-display font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                        <div className="flex items-center gap-1 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <Tag size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-500 uppercase">
                            {order.appliedPromoName}
                          </span>
                          {order.items.reduce((s, i) => s + i.price * i.quantity, 0) > order.total && (
                            <span className="text-[10px] font-bold text-emerald-500 ml-1">
                              (-{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0) - order.total)})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xl font-display font-bold text-primary">
                        {order.isRedemption ? `${order.pointsCost} pts` : formatCurrency(order.total)}
                      </p>
                    )}
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
                {order.hasPromo && !order.isRedemption && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center bg-primary/5 p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                        <Tag size={12} />
                        {order.appliedPromoName}
                        {order.promoMultiplier && order.promoMultiplier > 1 && (
                          <span className="bg-primary/20 px-1 rounded-sm">x{order.promoMultiplier}</span>
                        )}
                      </span>
                      <span className="text-[9px] text-neutral-500">Promo aplicada</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {order.items.reduce((s, i) => s + i.price * i.quantity, 0) > order.total && (
                        <span className="text-xs font-bold text-emerald-400">
                          -{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0) - order.total)}
                        </span>
                      )}
                      {order.pointsEarned - Math.floor(order.total * 10) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          +{order.pointsEarned - Math.floor(order.total * 10)} Pts
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-32">
      <header className="px-6 py-6 border-b border-white/5">
        <h1 className="text-2xl font-display font-bold mb-1">Panel Admin ⚡️</h1>
        <p className="text-neutral-500 text-xs font-medium">Gestiona tu imperio Choki</p>
      </header>

      <main className="p-6">
        {activeTab === 'admin-stats' && renderStats()}
        {activeTab === 'admin-orders' && renderOrders()}
        {activeTab === 'admin-shop' && renderShop()}
        {activeTab === 'admin-promos' && renderPromos()}
      </main>

      <AnimatePresence>
        {isProductModalOpen && renderProductModal()}
        {isPromoModalOpen && renderPromoModal()}
      </AnimatePresence>
    </div>
  );
}
