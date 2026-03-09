import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface ReportErrorModalProps {
  order: Order;
  onClose: () => void;
}

export function ReportErrorModal({ order, onClose }: ReportErrorModalProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'orderErrors'), {
        orderId: order.id,
        userId: order.userId,
        userName: order.userName,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Error reportado correctamente');
      onClose();
    } catch (error) {
      console.error('Error reporting:', error);
      toast.error('Error al reportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 w-full max-w-lg rounded-[2rem] border border-white/10 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <AlertCircle className="text-amber-500" /> Reportar error
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-neutral-400">Pedido: #{order.id.slice(-6)}</p>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-neutral-800 rounded-xl p-3 border border-white/5 focus:border-primary outline-none h-32"
            placeholder="Describe el error..."
            required
          />
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-neutral-950 font-display font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
            {loading ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
