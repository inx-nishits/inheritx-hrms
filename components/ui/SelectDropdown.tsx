"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateRangePicker } from './DateRangePicker';

interface SelectOption {
  value: string;
  label: string;
  showCalendar?: boolean;
}

interface SelectDropdownProps {
  options: string[] | SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCustomRangeClick?: () => void;
}

export function SelectDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...",
  className,
  onCustomRangeClick
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number; maxHeight?: string; width?: number; vertical?: 'top' | 'bottom'; horizontal?: 'left' | 'right' }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the container and dropdown
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };

    if (isOpen || showCalendar) {
      // Use both mousedown and click for better coverage
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, showCalendar]);

  // Calculate dynamic position when dropdown opens (for viewport-aware positioning)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      const calculatePosition = () => {
        if (!containerRef.current || !dropdownRef.current) return;
        
        const buttonRect = containerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get actual dropdown dimensions, or use button width as minimum
        const actualDropdownWidth = dropdownRect.width > 0 ? dropdownRect.width : buttonRect.width || 200;
        const dropdownWidth = Math.max(actualDropdownWidth, buttonRect.width || 200);
        const dropdownHeight = dropdownRect.height || 240;
        const padding = 8; // Minimum padding from viewport edges
        
        const newPosition: { top?: number; bottom?: number; left?: number; right?: number; maxHeight?: string; width?: number; vertical?: 'top' | 'bottom'; horizontal?: 'left' | 'right' } = {};
        
        // Calculate available space in all directions
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;
        
        // VERTICAL POSITIONING - Use relative positioning (top-full or bottom-full)
        // Check if we have enough space below (preferred direction)
        if (spaceBelow >= dropdownHeight + padding) {
          // Enough space below - open downward
          newPosition.top = undefined;
          newPosition.bottom = undefined;
        } 
        // Check if we have enough space above (flip direction)
        else if (spaceAbove >= dropdownHeight + padding) {
          // Not enough space below but enough above - flip upward
          newPosition.top = undefined;
          newPosition.bottom = undefined;
        } 
        // Neither side has enough space - use the side with MORE space
        else {
          if (spaceBelow > spaceAbove) {
            // More space below - open downward with maxHeight constraint
            newPosition.top = undefined;
            newPosition.bottom = undefined;
            newPosition.maxHeight = `${Math.max(100, spaceBelow - padding)}px`; // Minimum 100px height
          } else {
            // More space above - flip upward with maxHeight constraint
            newPosition.top = undefined;
            newPosition.bottom = undefined;
            newPosition.maxHeight = `${Math.max(100, spaceAbove - padding)}px`; // Minimum 100px height
          }
        }
        
        // HORIZONTAL POSITIONING - Use relative positioning (left-0 or right-0)
        // Check if we have enough space on the right (preferred direction - align left edge)
        if (spaceRight >= dropdownWidth + padding) {
          // Enough space on right - align to left edge of button
          newPosition.left = undefined;
          newPosition.right = undefined;
        } 
        // Check if we have enough space on the left (flip direction - align right edge)
        else if (spaceLeft >= dropdownWidth + padding) {
          // Not enough space on right but enough on left - flip to left side
          newPosition.left = undefined;
          newPosition.right = undefined;
        } 
        // Neither side has enough space - use the side with MORE space
        else {
          if (spaceRight > spaceLeft) {
            // More space on right - align left
            newPosition.left = undefined;
            newPosition.right = undefined;
          } else {
            // More space on left - flip to left side
            newPosition.left = undefined;
            newPosition.right = undefined;
          }
        }
        
        // Store button width for dropdown sizing
        newPosition.width = buttonRect.width;
        
        // Store vertical direction preference for CSS classes
        newPosition.vertical = spaceBelow >= spaceAbove ? 'bottom' : 'top';
        newPosition.horizontal = spaceRight >= spaceLeft ? 'left' : 'right';
        
        setPosition(newPosition);
      };
      
      // Calculate position after a small delay to ensure dropdown is rendered
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(calculatePosition);
        // Recalculate again after content is fully rendered to get accurate width
        setTimeout(() => {
          requestAnimationFrame(calculatePosition);
        }, 50);
      }, 0);
      
      // Recalculate on resize (but not scroll, as absolute positioning moves with parent)
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculatePosition);
      };
    } else {
      // Reset position when closed
      setPosition({});
    }
  }, [isOpen]);

  const normalizedOptions: SelectOption[] = options.map(opt => 
    typeof opt === 'string' 
      ? { value: opt, label: opt }
      : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (option: SelectOption) => {
    if (option.showCalendar || option.value === 'Custom Range') {
      setShowCalendar(true);
      setIsOpen(false);
      if (onCustomRangeClick) {
        onCustomRangeClick();
      }
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative h-10", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-full w-full items-center justify-between rounded-[8px] border border-input bg-background px-3 py-2 text-sm font-medium",
          "focus:outline-none",
          "transition-colors duration-200"
        )}
      >
        <span className={cn(value ? "text-foreground" : "text-muted-foreground")}>
          {displayValue}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                "absolute z-[100] bg-card border border-border rounded-[8px] shadow-lg overflow-hidden mt-2",
                position.vertical === 'top' ? 'bottom-full mb-2' : 'top-full',
                position.horizontal === 'right' ? 'right-0 mr-4' : 'left-0 ml-4',
                "max-w-[min(400px,calc(100vw-32px))]"
              )}
              style={{
                maxHeight: position.maxHeight || '240px',
                minWidth: `${Math.max(position.width || 200, 200)}px`,
                width: 'max-content',
              }}
            >
              <div className="overflow-y-auto" style={{ maxHeight: position.maxHeight || '240px' }}>
                {normalizedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent",
                      value === option.value && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {option.showCalendar && <Calendar className="h-4 w-4 flex-shrink-0" />}
                      <span className="whitespace-nowrap overflow-visible">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowCalendar(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 z-40"
            >
              <DateRangePicker
                onChange={(range) => {
                  if (range.start && range.end) {
                    onChange?.(`${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`);
                    setShowCalendar(false);
                  }
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


