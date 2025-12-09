import { cn } from '@/lib/utils';
import React from 'react';

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  description?: React.ReactNode;
}

export function PageTitle({ 
  children, 
  className, 
  as: Component = 'h1',
  size = 'lg',
  description,
  ...props 
}: PageTitleProps) {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-bold',
  };

  return (
    <div className="space-y-1">
      <Component 
        className={cn(sizeClasses[size], 'text-foreground', className)} 
        {...props}
      >
        {children}
      </Component>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}

