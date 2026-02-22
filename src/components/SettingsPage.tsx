import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { ArrowLeft, Camera, User, Mail, Lock, Eye, EyeOff, CheckCircle2, Moon, Sun, Download, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, updateUserName, updateUser, setActiveTab, theme, toggleTheme } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showPass, setShowPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
        toast.success('Foto de perfil actualizada');
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
        toast.success('Correo electrónico actualizado');
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
      toast.success('Contraseña actualizada correctamente');
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
            <label className="absolute bottom-0 right-0 bg-primary text-neutral-950 p-3 rounded-2xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-neutral-50 dark:border-neutral-950">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
          <p className="mt-4 text-xs text-neutral-500 font-bold uppercase tracking-widest">Toca para cambiar foto</p>
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

        {/* Name Update */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Nombre de usuario</h2>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-24 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white font-medium"
            />
            <button 
              onClick={handleNameUpdate}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-neutral-950 font-display font-bold text-xs rounded-xl"
            >
              Guardar
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 italic">Puedes cambiar tu nombre una vez cada 24 horas.</p>
          
          <button 
            onClick={() => {
              handleNameUpdate();
              toast.success('Cambios guardados correctamente');
            }}
            className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 mt-4"
          >
            Guardar cambios
          </button>
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
            {isVerifyingEmail && (
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input
                  type="text"
                  placeholder="Código de 4 dígitos (1234)"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border-2 border-primary rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white font-medium"
                />
              </div>
            )}
            <button 
              onClick={handleEmailUpdate}
              className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-display font-bold rounded-2xl transition-all active:scale-95"
            >
              {isVerifyingEmail ? 'Verificar Código' : 'Cambiar Correo'}
            </button>
          </div>
        </section>

        {/* Password Update */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Seguridad</h2>
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 border border-neutral-200 dark:border-white/5 space-y-4">
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
              className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
            >
              Actualizar Contraseña
            </button>
          </div>
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
                <h3 className="font-display font-bold text-neutral-900 dark:text-white">Instalar App</h3>
                <p className="text-xs text-neutral-500">Descarga la versión móvil</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
              <Download size={20} />
            </div>
          </button>
          <p className="text-[10px] text-neutral-400 italic text-center">
            Nota: Para generar un APK nativo, se requiere usar herramientas externas como Capacitor o Android Studio. Esta opción instala la Web App Progresiva (PWA).
          </p>
        </section>
      </main>
    </div>
  );
}
