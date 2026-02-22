import React, { useState } from 'react';
import { useApp } from '../context';
import { Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function Auth() {
  const { login, loginWithGoogle, register, resetPassword, isAuthMode, setIsAuthMode, loading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (isAuthMode === 'login') {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu correo');
      return;
    }
    
    setIsSubmitting(true);
    const success = await resetPassword(email);
    setIsSubmitting(false);
    
    if (success) {
      setIsForgotPassword(false);
      setPassword('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button 
            onClick={() => setIsForgotPassword(false)}
            className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Ingresa tu correo para recibir un enlace de recuperación
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Correo'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 rotate-12">
            <span className="font-display font-bold text-4xl">C</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
            {isAuthMode === 'login' ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {isAuthMode === 'login' 
              ? 'Ingresa tus credenciales para continuar' 
              : 'Únete a la comunidad de amantes del chocolate'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isAuthMode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isAuthMode === 'login' && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-neutral-500 hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Procesando...' : (isAuthMode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-display font-bold rounded-2xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Chrome size={20} />
            Continuar con Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {isAuthMode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button
              onClick={() => setIsAuthMode(isAuthMode === 'login' ? 'register' : 'login')}
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isAuthMode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
