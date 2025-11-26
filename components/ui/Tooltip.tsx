"use client";

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  asChild?: boolean;
}

export function Tooltip({ children, content, side = 'top', className, asChild }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Use requestAnimationFrame to ensure tooltip is rendered
      requestAnimationFrame(() => {
        if (tooltipRef.current && triggerRef.current) {
          const tooltip = tooltipRef.current;
          const trigger = triggerRef.current;
          const rect = trigger.getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
          
          let top = 0;
          let left = 0;
          
          // Calculate position based on side
          switch (side) {
            case 'top':
              top = -tooltipRect.height - 8;
              left = rect.width / 2 - tooltipRect.width / 2;
              break;
            case 'bottom':
              top = rect.height + 8;
              left = rect.width / 2 - tooltipRect.width / 2;
              break;
            case 'left':
              top = rect.height / 2 - tooltipRect.height / 2;
              left = -tooltipRect.width - 8;
              break;
            case 'right':
              top = rect.height / 2 - tooltipRect.height / 2;
              left = rect.width + 8;
              break;
          }
          
          // Adjust for viewport boundaries
          const finalLeft = rect.left + left;
          const finalTop = rect.top + top;
          
          if (finalLeft < 8) {
            left = -rect.left + 8;
          } else if (finalLeft + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - rect.left - tooltipRect.width - 8;
          }
          
          if (finalTop < 8) {
            top = -rect.top + 8;
          } else if (finalTop + tooltipRect.height > viewportHeight - 8) {
            top = viewportHeight - rect.top - tooltipRect.height - 8;
          }
          
          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
          tooltip.style.transform = 'none';
        }
      });
    }
  }, [isVisible, side]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: () => setIsVisible(true),
      onMouseLeave: () => setIsVisible(false),
      onFocus: () => setIsVisible(true),
      onBlur: () => setIsVisible(false),
      'aria-describedby': content ? tooltipId : undefined,
    });
  }

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-medium text-primary-foreground bg-foreground rounded-[8px] shadow-lg',
            'whitespace-normal max-w-xs pointer-events-none',
            'animate-fade-in'
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side="top">
      <Info className={cn('h-4 w-4 text-muted-foreground hover:text-foreground cursor-help', className)} aria-label="Information" />
    </Tooltip>
  );
}

