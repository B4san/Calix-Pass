import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, showPasswordToggle = true, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordInput = type === 'password';
    const canTogglePassword = isPasswordInput && showPasswordToggle;
    const resolvedType = canTogglePassword ? (showPassword ? 'text' : 'password') : type;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[#243148]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`
              w-full px-4 py-2
              bg-white
              border border-[#d9e0ef]
              rounded-xl
              text-[#1f2a3d]
              placeholder:text-[#8d9bb3]
              transition-colors duration-200
              hover:border-[#9fb4ff]
              focus:outline-none focus:border-[#2756f6] focus:ring-2 focus:ring-[#2756f6]/20
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
              ${canTogglePassword ? 'pr-11' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
            {...props}
          />
          {canTogglePassword && (
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#d7e0f2] bg-white p-1.5 text-[#41506d] shadow-sm hover:bg-[#f4f7ff] hover:text-[#1f2a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2756f6]/35"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                  <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a12.82 12.82 0 01-4.34 5.55" />
                  <path d="M6.61 6.61A12.36 12.36 0 001 12.5C2.73 16.89 7 20 12 20a10.9 10.9 0 005.4-1.35" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12.5C2.73 8.11 7 5 12 5s9.27 3.11 11 7.5C21.27 16.89 17 20 12 20S2.73 16.89 1 12.5z" />
                  <circle cx="12" cy="12.5" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[#7d8ca6]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
