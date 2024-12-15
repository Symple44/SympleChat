// src/components/common/Toast.jsx
import React from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Info, X,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { motion, AnimatePresence } from 'framer-motion';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconClassName: 'text-blue-500'
  }
};

const Toast = () => {
  const { toasts, removeToast } = useStore(state => ({
    toasts: state.toasts,
    removeToast: state.removeToast
  }));

  const handleRemove = (id) => {
    removeToast(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, className, iconClassName } = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex items-start p-4 rounded-lg border shadow-lg ${className}`}
            >
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${iconClassName}`} />
              </div>

              <div className="ml-3 flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {toast.title}
                  </h4>
                )}
                <p className={`text-sm ${
                  toast.title ? 'mt-1' : ''
                } text-gray-700 dark:text-gray-300`}>
                  {toast.message}
                </p>
                {toast.action && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        toast.action.onClick();
                        handleRemove(toast.id);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500
                               dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {toast.action.label}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemove(toast.id)}
                className="ml-4 flex-shrink-0 p-1 rounded-full
                         hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              {/* Barre de progression */}
              {toast.duration !== Infinity && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 
                           dark:bg-gray-700 origin-left"
                  onAnimationComplete={() => handleRemove(toast.id)}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
