import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, options, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-[var(--color-surface)] 
            border border-[var(--color-border)]
            text-[var(--color-text-primary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

