import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({ open, onClose, title, description, children, size = 'md' }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  
  if (!open) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0d1832]/35 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog Panel */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white/95
          rounded-3xl
          shadow-[0_28px_70px_rgba(8,25,66,0.2)]
          border border-[#dfe5f1]
          max-h-[92vh]
          overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="px-7 pt-7 pb-4">
            {title && (
              <h2 className="text-xl font-semibold text-[#1f2a3d] leading-none tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-[#72819a]">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-7 pt-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
