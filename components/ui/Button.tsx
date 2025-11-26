import { cn } from '@/lib/utils';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  loading = false,
  loadingText,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg shadow-md shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:border-border/80',
    outline: 'border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/30 hover:shadow-sm',
    ghost: 'hover:bg-accent/80 hover:text-accent-foreground',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </>
      )}
      {loading ? loadingText || children : children}
    </button>
  );
}

