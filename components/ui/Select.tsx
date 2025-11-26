import { cn } from '@/lib/utils';
import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[] | { value: string; label: string }[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, hint, id, required, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-semibold text-foreground"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        <select
          id={selectId}
          className={cn(
            'flex h-11 w-full rounded-[8px] border border-input bg-background px-4 py-2.5 text-sm font-medium',
            'ring-offset-background cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'transition-all duration-300 ease-out',
            'shadow-sm hover:border-primary/40 hover:shadow-md',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hintId}
          aria-required={required}
          required={required}
          {...props}
        >
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        {error && (
          <p id={errorId} className="text-sm font-medium text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

