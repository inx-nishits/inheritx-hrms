import { cn, getInitials } from '@/lib/utils';
import React from 'react';

interface AvatarProps {
  name?: string | null;
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, alt, fallback, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  const label = alt || name || 'Avatar';

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn('rounded-full object-cover ring-2 ring-border shadow-sm', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-sm ring-2 ring-border',
        sizes[size],
        className
      )}
      aria-label={label}
    >
      {fallback || getInitials(name || alt)}
    </div>
  );
}

