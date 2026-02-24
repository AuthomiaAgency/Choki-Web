import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context';
import { Download, Sparkles, Heart, Star, Coffee, Cookie, IceCream, Candy } from 'lucide-react';

export interface LandingPageProps {
  config?: {
    name: string;
    welcomeMessage: string;
    buttonText: string;
  };
  onComplete?: () => void;
}

export function LandingPage({ config, onComplete }: LandingPageProps) {
  const { advancedConfig } = useApp();
  const activeConfig = config || {
    name: advancedConfig.landingName || 'Choki Lover',
    welcomeMessage: advancedConfig.landingWelcome || 'Bienvenido a la experiencia Choki',
    buttonText: advancedConfig.landingButtonText || 'Instalar Aquí'
  };

  const handleInstall = async () => {
    // Force download of the dummy APK file
    const dummyApkContent = "Este es un archivo de instalación web. Para instalar la app real, abre este enlace en Chrome (Android) o Safari (iOS) y selecciona 'Agregar a la pantalla de inicio'.";
    const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'Choki_App.apk';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Optional: Call onComplete if we want to let them into the app after downloading
    // if (onComplete) onComplete();
  };

  const floatingIcons = [
    { Icon: Heart, color: 'text-pink-500', delay: 0 },
    { Icon: Star, color: 'text-yellow-400', delay: 1 },
    { Icon: Sparkles, color: 'text-primary', delay: 2 },
    { Icon: Coffee, color: 'text-amber-600', delay: 3 },
    { Icon: Cookie, color: 'text-orange-400', delay: 1.5 },
    { Icon: IceCream, color: 'text-pink-300', delay: 2.5 },
    { Icon: Candy, color: 'text-red-400', delay: 0.5 },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              y: -100,
              opacity: [0, 0.5, 0],
              rotate: 360
            }}
            transition={{ 
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute text-primary/20"
          >
            <Sparkles size={24 + Math.random() * 48} />
          </motion.div>
        ))}
      </div>

      {/* Floating Icons */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-32 h-32 bg-primary rounded-[3rem] flex items-center justify-center shadow-2xl shadow-primary/40 mb-8 relative"
        >
          <img 
            src="https://copilot.microsoft.com/th/id/BCO.0422c8a8-09b8-4328-bec7-f147697257f1.png" 
            alt="Logo" 
            className="w-24 h-24 object-contain"
          />
          
          {floatingIcons.map(({ Icon, color, delay }, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -20, 0],
                x: [0, i % 2 === 0 ? 10 : -10, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay,
                ease: "easeInOut"
              }}
              className={`absolute ${i === 0 ? '-top-4 -right-4' : i === 1 ? '-bottom-4 -left-4' : i === 2 ? 'top-1/2 -left-8' : 'bottom-1/2 -right-8'} ${color}`}
            >
              <Icon size={32} fill="currentColor" className="opacity-80" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
            Hola, <span className="text-primary">{activeConfig.name}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-400 font-medium max-w-md mx-auto leading-relaxed">
            {activeConfig.welcomeMessage}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleInstall}
          className="mt-12 bg-primary text-neutral-950 px-10 py-5 rounded-2xl font-display font-bold text-xl flex items-center gap-3 shadow-2xl shadow-primary/30 group"
        >
          <Download size={24} className="group-hover:bounce" />
          {activeConfig.buttonText}
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          onClick={onComplete || (() => window.location.reload())}
          className="mt-8 text-neutral-500 text-sm font-bold uppercase tracking-widest hover:opacity-100 transition-opacity"
        >
          Continuar a la web
        </motion.button>
      </div>
    </div>
  );
}
