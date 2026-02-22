import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { ArrowLeft, Camera, User, Mail, Lock, Eye, EyeOff, CheckCircle2, Moon, Sun, Download, Smartphone, Bell, ShoppingBag, ChevronDown, ChevronUp, Save, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, updateUserName, updateUser, setActiveTab, theme, toggleTheme, requestNotificationPermission } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showPass, setShowPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPasswordCollapsed, setIsPasswordCollapsed] = useState(true);

  const handleSaveAll = async () => {
    try {
      if (name.trim() !== '' && name !== user?.name) {
        await updateUserName(name);
      }
      if (email !== user?.email && !isVerifyingEmail) {
        // Trigger email verification logic if needed, or just update if simple
        await updateUser({ email });
      }
      setActiveTab('profile');
    } catch (e: any) {
      toast.error('Error al guardar: ' + e.message);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('Para instalar la App:', {
        description: 'En iPhone: Toca "Compartir" y luego "Agregar a Inicio".\nEn Android: Toca el menú y "Instalar aplicación".'
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameUpdate = () => {
    if (name.trim() === '') return;
    updateUserName(name);
  };

  const handleEmailUpdate = () => {
    if (!isVerifyingEmail) {
      setIsVerifyingEmail(true);
      toast.info('Se ha enviado un código de verificación a tu nuevo correo (Simulado)');
    } else {
      if (verificationCode === '1234') {
        updateUser({ email });
        setIsVerifyingEmail(false);
        setVerificationCode('');
      } else {
        toast.error('Código de verificación incorrecto');
      }
    }
  };

  const handlePasswordUpdate = () => {
    if (newPass !== confirmPass) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    // Mock verification
    if (currentPass === '1234567890' || currentPass === 'password') {
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      toast.error('Contraseña actual incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      <header className="sticky top-0 z-30 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-200 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-neutral-900 dark:text-white">Configuración</h1>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Profile Photo */}
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 p-1">
              <img 
                src={user?.avatar} 
                alt={user?.name} 
                className="w-full h-full object-cover rounded-[2rem]"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-500 font-bold uppercase tracking-widest mb-4">Elige tu avatar</p>
          
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => {
              const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 123}`;
              return (
                <button
                  key={i}
                  onClick={() => {
                    updateUser({ avatar: avatarUrl });
                  }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${user?.avatar === avatarUrl ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent hover:border-white/20'}`}
                >
                  <img src={avatarUrl} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Apariencia</h2>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-neutral-900 dark:text-white">Tema de la App</h3>
                <p className="text-xs text-neutral-500">{theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-neutral-200'}`}>
              <motion.div 
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: theme === 'dark' ? 20 : 0 }}
              />
            </div>
          </button>
        </section>

        {/* Notifications */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Notificaciones</h2>
          <button 
            onClick={requestNotificationPermission}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                <Bell size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-neutral-900 dark:text-white">Activar Notificaciones</h3>
                <p className="text-xs text-neutral-500">Recibe alertas de tus pedidos</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${Notification.permission === 'granted' ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
              <motion.div 
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: Notification.permission === 'granted' ? 20 : 0 }}
              />
            </div>
          </button>
        </section>

        {/* Name Update */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Nombre de usuario</h2>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <p className="text-[10px] text-neutral-400 italic">Puedes cambiar tu nombre una vez cada 24 horas.</p>
        </section>

        {/* Email Update */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Correo Electrónico</h2>
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isVerifyingEmail}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white font-medium disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* Password Update */}
        <section className="space-y-4">
          <button 
            onClick={() => setIsPasswordCollapsed(!isPasswordCollapsed)}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-neutral-900 dark:text-white">Seguridad</h3>
                <p className="text-xs text-neutral-500">Cambiar contraseña</p>
              </div>
            </div>
            {isPasswordCollapsed ? <ChevronDown size={20} className="text-neutral-400" /> : <ChevronUp size={20} className="text-neutral-400" />}
          </button>
          
          <AnimatePresence>
            {!isPasswordCollapsed && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 border border-neutral-200 dark:border-white/5 space-y-4 mt-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Contraseña actual"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl outline-none dark:text-white"
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl outline-none dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nueva contraseña"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl outline-none dark:text-white"
                    />
                  </div>
                  
                  <button 
                    onClick={handlePasswordUpdate}
                    className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-display font-bold rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* App Installation */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Aplicación</h2>
          <button 
            onClick={handleInstallClick}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Smartphone size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-neutral-900 dark:text-white">Descargar APK</h3>
                <p className="text-xs text-neutral-500">Instalación directa en Android/iOS</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
              <Download size={20} />
            </div>
          </button>
          <p className="text-[10px] text-neutral-400 italic text-center">
            Instala la aplicación oficial para una experiencia nativa fluida. En iOS, usa "Compartir" {'>'} "Agregar a Inicio".
          </p>
        </section>

        {/* Final Save Button */}
        <section className="pt-8">
          <button 
            onClick={handleSaveAll}
            className="w-full py-5 bg-primary text-neutral-950 font-display font-bold rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Save size={20} />
            Guardar Configuración
          </button>
        </section>
      </main>
    </div>
  );
}
