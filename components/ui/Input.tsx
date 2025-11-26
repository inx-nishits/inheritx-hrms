import { cn } from '@/lib/utils';
import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = 'text', id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={inputId} 
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
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-[8px] border border-input bg-background px-4 py-2.5 text-sm font-medium',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'transition-colors duration-200',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hintId}
          aria-required={required}
          required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm font-medium text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

