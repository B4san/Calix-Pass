import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../stores/uiStore';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  
  if (toasts.length === 0) return null;
  
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

interface ToastProps {
  toast: { id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' };
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 150);
  };
  
  useEffect(() => {
    const timer = setTimeout(handleClose, 3800);
    return () => clearTimeout(timer);
  }, []);
  
  const typeStyles = {
    success: 'bg-[var(--success)] text-white',
    error: 'bg-[var(--error)] text-white',
    warning: 'bg-[var(--warning)] text-white',
    info: 'bg-[var(--slate-700)] text-white',
  };
  
  const icons = {
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)]
        shadow-[var(--shadow-lg)]
        transition-all duration-150
        ${typeStyles[toast.type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={handleClose}
        className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
