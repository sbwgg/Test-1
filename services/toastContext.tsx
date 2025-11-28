
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info')
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`pointer-events-auto min-w-[300px] max-w-md bg-[#1e293b] border-l-4 rounded-r-lg shadow-2xl p-4 flex items-start justify-between gap-3 transform transition-all duration-300 animate-slide-up ${
              t.type === 'success' ? 'border-green-500' : 
              t.type === 'error' ? 'border-red-500' : 'border-blue-500'
            }`}
          >
             <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-0.5 capitalize">{t.type}</p>
                    <p className="text-sm font-medium text-gray-300 leading-tight">{t.message}</p>
                </div>
             </div>
             <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-white transition-colors">
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
