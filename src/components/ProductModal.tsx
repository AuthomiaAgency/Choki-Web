import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context';
import { formatCurrency } from '../utils';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
    setQuantity(1);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:w-[500px] md:left-1/2 md:-translate-x-1/2 bg-neutral-900 rounded-3xl z-50 overflow-hidden flex flex-col border border-white/10 shadow-2xl"
          >
            {/* Image Header */}
            <div className="relative h-64 shrink-0">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-serif font-bold text-white">{product.name}</h2>
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  +{product.points} Pts
                </div>
              </div>
              
              <p className="text-2xl font-bold text-primary mb-6">{formatCurrency(product.price)}</p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-neutral-500 font-bold mb-2">Descripción</h3>
                  <p className="text-neutral-300 leading-relaxed">{product.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-neutral-500 font-bold mb-2">Ingredientes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-800 rounded-lg text-sm text-neutral-300 border border-white/5">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-neutral-800/50 border-t border-white/5">
              <div className="flex gap-4">
                <div className="flex items-center gap-4 bg-neutral-900 px-4 py-3 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                >
                  <ShoppingBag size={20} />
                  Añadir a la Bolsita
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
