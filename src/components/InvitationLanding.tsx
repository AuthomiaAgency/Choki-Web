import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context';
import { Gift, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';

export interface InvitationLandingProps {
  slug?: string;
  onAccept?: () => void;
}

export function InvitationLanding({ slug, onAccept }: InvitationLandingProps) {
  const { advancedConfig } = useApp();
  
  // Find config if it exists, otherwise use defaults
  const config = advancedConfig?.landings?.find(l => l.slug === slug);
  
  const name = config?.name || 'Un Amigo';
  const message = config?.welcomeMessage || 'Te ha enviado una invitación especial para probar Choki.';
  const buttonText = config?.buttonText || 'Aceptar Invitación';

  const handleInstall = async () => {
    // Try to trigger PWA install
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
      }
    } else {
      // Fallback or just simulate
      alert('Para instalar: \niOS: Compartir -> Agregar a Inicio\nAndroid: Menú -> Instalar Aplicación');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,100,0,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[100px] rounded-full" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-900/20 blur-[100px] rounded-full" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.2,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full px-6 text-center">
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 relative inline-block"
        >
          <div className="absolute inset-0 bg-orange-500 blur-[40px] opacity-40 rounded-full animate-pulse" />
          <img 
            src="https://copilot.microsoft.com/th/id/BCO.0422c8a8-09b8-4328-bec7-f147697257f1.png" 
            alt="Choki Logo" 
            className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-white/10 rounded-full border-dashed z-0"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={12} />
            Invitación Exclusiva
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
              {name}
            </span>
            <br />
            <span className="text-2xl sm:text-3xl font-normal text-neutral-400">
              te ha invitado
            </span>
          </h1>

          <p className="text-lg text-neutral-300 leading-relaxed font-light">
            "{message}"
          </p>

          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstall}
              className="group relative w-full py-5 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-white to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-3">
                {buttonText}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-neutral-500 text-xs uppercase tracking-widest"
        >
          Experiencia Premium Choki
        </motion.p>

      </div>
    </div>
  );
}
