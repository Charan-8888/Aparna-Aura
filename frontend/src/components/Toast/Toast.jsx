import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLOR_MAP = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-500',
    progress: 'bg-emerald-400',
    text: 'text-emerald-800',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    progress: 'bg-red-400',
    text: 'text-red-800',
  },
  info: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    progress: 'bg-amber-400',
    text: 'text-amber-800',
  },
};

const ToastItem = ({ toast, onRemove }) => {
  const Icon = ICON_MAP[toast.type] || Info;
  const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative overflow-hidden rounded-xl border shadow-lg ${colors.bg} min-w-[300px] max-w-[400px]`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={20} className={`flex-shrink-0 mt-0.5 ${colors.icon}`} />
        <p className={`text-sm font-medium flex-1 ${colors.text}`}>{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-black/5">
        <div
          className={`h-full ${colors.progress} toast-progress`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </motion.div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-sm:bottom-4 max-sm:right-4 max-sm:left-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
