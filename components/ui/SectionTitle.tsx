import { cn } from '@/lib/utils';
import React from 'react';

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg';
}

export function SectionTitle({ 
  children, 
  className, 
  as: Component = 'h2',
  size = 'md',
  ...props 
}: SectionTitleProps) {
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
  };

  return (
    <Component 
      className={cn(sizeClasses[size], 'text-foreground', className)} 
      {...props}
    >
      {children}
    </Component>
  );
}

