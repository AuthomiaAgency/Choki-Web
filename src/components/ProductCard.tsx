import { motion } from 'motion/react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { Plus, Heart } from 'lucide-react';
import { FC } from 'react';
import React from 'react';
import { useApp } from '../context';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, user, highlightedProductIds } = useApp();
  const isAdmin = user?.role === 'admin';
  const isHighlighted = highlightedProductIds.includes(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) addToCart(product, 1);
  };

  return (
    <motion.div
      layoutId={`product-${product.id}`}
      whileTap={{ scale: 0.98 }}
      className={`group relative bg-white dark:bg-neutral-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border shadow-lg sm:shadow-xl cursor-default flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-primary/5 ${
        isHighlighted 
          ? 'border-primary shadow-primary/30 ring-2 ring-primary/50 scale-[1.02]' 
          : 'border-neutral-200 dark:border-white/5'
      }`}
    >
      {isHighlighted && (
        <div className="absolute inset-0 bg-primary/5 z-0 pointer-events-none animate-pulse" />
      )}
      <div 
        onClick={onClick}
        className="aspect-square overflow-hidden relative cursor-pointer p-3 sm:p-4"
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover rounded-[1rem] sm:rounded-[1.5rem] transition-transform duration-500 group-hover:scale-105"
        />
        
        {product.stock < 20 && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-red-500/90 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/10 shadow-sm z-10">
            <span className="text-[7px] sm:text-[8px] font-bold text-white uppercase font-display">¡Últimos!</span>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-5 pb-3 sm:pb-5 flex flex-col flex-grow">
        <div onClick={onClick} className="cursor-pointer flex-grow">
          <h3 className="font-display text-base sm:text-xl font-bold text-neutral-900 dark:text-white leading-tight mb-0.5 sm:mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-primary font-bold font-display text-sm sm:text-lg mb-2 sm:mb-4">
            {formatCurrency(product.price)}
          </p>
        </div>
        
        {!isAdmin && (
          <button
            onClick={handleAdd}
            className="w-full py-2.5 sm:py-4 bg-primary text-neutral-950 font-display font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-2"
          >
            <Plus size={16} sm:size={18} strokeWidth={3} />
            Añadir
          </button>
        )}
      </div>
    </motion.div>
  );
};
