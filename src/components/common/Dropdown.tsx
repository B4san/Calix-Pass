import { type ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'start' | 'end';
}

export function Dropdown({ trigger, children, align = 'start' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);
  
  const close = () => setOpen(false);
  
  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      
      {open && (
        <div
          className={`
            absolute z-50 mt-1 min-w-[160px]
            bg-[var(--surface-elevated)]
            border border-[var(--border-default)]
            rounded-[var(--radius-lg)]
            shadow-[var(--shadow-elevated)]
            py-1
            animate-[dropdownIn_0.15s_ease-out]
            ${align === 'end' ? 'right-0' : 'left-0'}
          `}
        >
          {typeof children === 'function' 
            ? (children as (close: () => void) => ReactNode)(close)
            : children}
        </div>
      )}
      
      <style>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onClick, danger, disabled }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2 text-left text-sm
        transition-colors duration-[var(--transition-fast)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${danger 
          ? 'text-[var(--error)] hover:bg-[var(--error-muted)]' 
          : 'text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
        }
      `}
    >
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-[var(--border-subtle)]" />;
}
