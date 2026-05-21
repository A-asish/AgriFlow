import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }) => {
    const id = Date.now();
    const newToast = {
      id,
      title,
      description,
      variant,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toast,
    removeToast,
    toasts
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`rounded-lg shadow-lg p-4 min-w-75 animate-in slide-in-from-right-5 ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
              : 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              {toast.title && (
                <h4 className="font-semibold text-sm">{toast.title}</h4>
              )}
              {toast.description && (
                <p className="text-sm mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};