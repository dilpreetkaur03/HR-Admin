import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-[var(--color-surface)] 
            border border-[var(--color-border)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-secondary)]/50
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

