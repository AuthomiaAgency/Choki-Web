import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Search, Trophy, Crown, Camera, Sparkles, ExternalLink } from 'lucide-react';
import { CHOCOLATE_AVATARS } from '../utils';

interface UpdatesModalProps {
  onClose: () => void;
}

export function UpdatesModal({ onClose }: UpdatesModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'intro',
      title: 'Nuevos cambios en Choki para nuestra comunidad chocotejera',
      description: 'Hemos rediseñado la app para que sea más elegante e intuitiva. ¡Descubre todas las novedades!',
    },
    {
      id: 'home',
      title: 'Nueva Interfaz de Inicio',
      description: 'Pasamos de un diseño cuadrado a barras rectangulares más elegantes. ¡Encuentra tus chocotejas favoritas más rápido!',
    },
    {
      id: 'ranking',
      title: 'Nuevo apartado Ranking',
      description: '¡Compite con otros amantes de las chocotejas! Acumula compras y canjea premios para coronarte en el Top 5.',
    },
    {
      id: 'prize',
      title: 'Premio solo en Chokipoints',
      description: 'Al final de cada mes, el ganador del ranking de Chokipoints podrá crear su propia chocoteja especial ¡totalmente gratis!',
    },
    {
      id: 'profile',
      title: 'Customiza tu Perfil',
      description: 'Elige entre nuestros nuevos y amigables avatares chocotejeros que inspiran confianza.',
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-[340px] bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Graphic Area */}
          <div className="h-[220px] bg-neutral-50 dark:bg-neutral-800/50 relative overflow-hidden flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                {/* Slide 1: Intro */}
                {slides[currentSlide].id === 'intro' && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }} 
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute z-20"
                    >
                      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-xl border border-primary/20 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Sparkles size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-2" />
                          <div className="h-2 w-12 bg-primary/40 rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      animate={{ y: [0, 10, 0], rotate: [-5, -5, -5] }} 
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                      className="absolute left-4 top-4 z-10 opacity-60"
                    >
                      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-lg border border-neutral-200 dark:border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 rounded-xl" />
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, -8, 0], rotate: [5, 5, 5] }} 
                      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                      className="absolute right-4 bottom-4 z-10 opacity-60"
                    >
                      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-lg border border-neutral-200 dark:border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl" />
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Slide 2: Home Comparison */}
                {slides[currentSlide].id === 'home' && (
                  <div className="flex items-center gap-2 w-full max-w-[300px] justify-center">
                    {/* Before */}
                    <div className="flex-1 max-w-[120px] bg-white dark:bg-neutral-800 rounded-2xl p-2 shadow-sm border border-neutral-100 dark:border-white/5 opacity-60 scale-95">
                      <div className="text-[10px] font-bold text-neutral-400 mb-2 text-center">ANTES</div>
                      <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                        <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                      </div>
                    </div>
                    {/* After */}
                    <div className="flex-1 max-w-[140px] bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-xl border border-primary/20 relative z-10 scale-105">
                      <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg animate-bounce">
                        <Sparkles size={10} />
                      </div>
                      <div className="text-[10px] font-bold text-primary mb-2 text-center">AHORA</div>
                      <div className="w-full h-5 bg-neutral-100 dark:bg-neutral-900 rounded-full mb-2 flex items-center px-2 gap-1 border border-neutral-200 dark:border-white/10">
                        <Search size={8} className="text-neutral-400" />
                        <div className="w-8 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-8 w-full bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 rounded-xl border border-orange-200/50 dark:border-orange-500/20" />
                        <div className="h-8 w-full bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl border border-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Slide 3: Ranking */}
                {slides[currentSlide].id === 'ranking' && (
                  <div className="relative w-full h-full flex items-end justify-center pb-8">
                    <div className="flex items-end gap-3">
                      {/* 2nd Place */}
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 80 }} transition={{ delay: 0.2 }}
                        className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-t-2xl relative flex justify-center"
                      >
                        <div className="absolute -top-10 w-12 h-12 rounded-full border-4 border-white dark:border-neutral-800 bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center font-bold text-neutral-500">2</div>
                      </motion.div>
                      {/* 1st Place */}
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 120 }} transition={{ delay: 0.1 }}
                        className="w-20 bg-gradient-to-t from-primary to-yellow-400 rounded-t-2xl relative flex justify-center shadow-xl shadow-primary/20"
                      >
                        <motion.div 
                          animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-12 flex flex-col items-center"
                        >
                          <Crown size={24} className="text-yellow-500 fill-yellow-500 mb-1" />
                          <div className="w-14 h-14 rounded-full border-4 border-white dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-lg">
                            <Trophy size={20} className="text-primary" />
                          </div>
                        </motion.div>
                      </motion.div>
                      {/* 3rd Place */}
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 60 }} transition={{ delay: 0.3 }}
                        className="w-16 bg-orange-200 dark:bg-orange-900/50 rounded-t-2xl relative flex justify-center"
                      >
                        <div className="absolute -top-10 w-12 h-12 rounded-full border-4 border-white dark:border-neutral-800 bg-orange-300 dark:bg-orange-800 flex items-center justify-center font-bold text-orange-700 dark:text-orange-300">3</div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Slide 4: Prize */}
                {slides[currentSlide].id === 'prize' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} 
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="bg-gradient-to-br from-primary to-orange-500 p-1 rounded-3xl shadow-2xl shadow-primary/30"
                    >
                      <div className="bg-white dark:bg-neutral-900 rounded-[22px] p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Sparkles size={32} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Premio Mensual</p>
                          <p className="font-display font-bold text-neutral-900 dark:text-white text-lg leading-tight">Tu propia chocoteja<br/>personalizada</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Slide 5: Profile */}
                {slides[currentSlide].id === 'profile' && (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
                    <div className="aspect-square bg-white dark:bg-neutral-800 rounded-3xl shadow-md border border-neutral-100 dark:border-white/5 flex items-center justify-center p-2 relative overflow-hidden group">
                      <img src={CHOCOLATE_AVATARS[1]} alt="Avatar 1" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <div className="aspect-square bg-white dark:bg-neutral-800 rounded-3xl shadow-md border border-neutral-100 dark:border-white/5 flex items-center justify-center p-2">
                      <img src={CHOCOLATE_AVATARS[2]} alt="Avatar 2" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <div className="aspect-square bg-white dark:bg-neutral-800 rounded-3xl shadow-md border border-neutral-100 dark:border-white/5 flex items-center justify-center p-2">
                      <img src={CHOCOLATE_AVATARS[3]} alt="Avatar 3" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <div className="aspect-square bg-primary/10 rounded-3xl shadow-inner border border-primary/20 flex flex-col items-center justify-center text-primary gap-2">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold">Tu foto</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text Content */}
          <div className="p-8 text-center flex-grow flex flex-col">
            <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
              {slides[currentSlide].description}
            </p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-neutral-200 dark:bg-neutral-800'}`}
                />
              ))}
            </div>

            {/* Action Button */}
            <button 
              onClick={nextSlide}
              className="w-full py-4 rounded-2xl bg-primary text-neutral-950 font-bold font-display text-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25"
            >
              {currentSlide === slides.length - 1 ? '¡Empezar!' : 'Siguiente'}
              {currentSlide < slides.length - 1 && <ArrowRight size={20} />}
            </button>
            
            {/* Footer Branding */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <img src="/pwa-192x192.png" alt="Choki" className="w-4 h-4 rounded-full grayscale opacity-50" />
              <a 
                href="https://www.authomia.cloud/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-neutral-400 hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                Cambios por Authomia Agency
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
