import { motion } from 'motion/react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { FC } from 'react';
import React from 'react';
import { useApp } from '../context';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, user, highlightedProductIds, promos } = useApp();
  const isAdmin = user?.role === 'admin';
  const isHighlighted = highlightedProductIds.includes(product.id);
  
  const hasActivePromo = promos.some(p => 
    p.active && (
      (p.condition.type === 'product_id' && p.condition.target === product.id) ||
      (p.condition.type === 'product_list' && p.condition.targets?.includes(product.id))
    )
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) addToCart(product, 1);
  };

  return (
    <motion.div
      layoutId={`product-${product.id}`}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 flex items-center gap-4 cursor-pointer transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border ${
        isHighlighted 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-neutral-200 dark:border-white/5 hover:border-primary/30'
      }`}
    >
      {isHighlighted && (
        <div className="absolute inset-0 bg-primary/5 z-0 pointer-events-none animate-pulse rounded-2xl" />
      )}
      
      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 py-1 pr-2 flex flex-col justify-center">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-display text-[15px] sm:text-base leading-tight font-bold text-neutral-900 dark:text-white line-clamp-2">
            {product.name}
          </h3>
          {hasActivePromo && (
            <span className="shrink-0 bg-primary text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
              Promo
            </span>
          )}
          {product.stock < 20 && !hasActivePromo && (
            <span className="shrink-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
              Hot
            </span>
          )}
        </div>
        <p className="text-primary font-bold font-display text-sm sm:text-base mt-1">
          {formatCurrency(product.price)}
        </p>
      </div>

      {/* Action Button */}
      {!isAdmin && (
        <button
          onClick={handleAdd}
          className="shrink-0 px-4 py-2 bg-primary text-neutral-950 font-display font-bold text-xs sm:text-sm rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          COMPRAR
        </button>
      )}
    </motion.div>
  );
};
