"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD) for form compatibility
  onChange?: (value: string) => void; // Returns ISO date string
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  className,
  error,
  required,
  disabled
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [position, setPosition] = useState<{ vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dynamic position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const calculatePosition = () => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const calendarHeight = 380;
        const calendarWidth = 320;
        const padding = 8;
        
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        
        let vertical: 'top' | 'bottom' = 'bottom';
        let horizontal: 'left' | 'right' = 'left';
        
        if (spaceBelow >= calendarHeight + padding) {
          vertical = 'bottom';
        } else if (spaceAbove >= calendarHeight + padding) {
          vertical = 'top';
        } else {
          vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';
        }
        
        if (spaceRight >= calendarWidth + padding) {
          horizontal = 'left';
        } else if (spaceLeft >= calendarWidth + padding) {
          horizontal = 'right';
        } else {
          horizontal = spaceRight > spaceLeft ? 'left' : 'right';
        }
        
        setPosition({ vertical, horizontal });
      };

      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
      };
    } else {
      setPosition(null);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateForInput = (date: Date) => {
    // Format as YYYY-MM-DD for HTML input compatibility
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = formatDateForInput(date);
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedDate(null);
    onChange?.('');
    setIsOpen(false);
  };

  const days = getDaysInMonth(currentMonth);
  const displayText = selectedDate ? formatDate(selectedDate) : placeholder;

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full", className)}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-11 items-center justify-between rounded-[8px] border bg-background px-3 py-2 text-sm font-medium w-full",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200",
          error 
            ? "border-red-500 focus:ring-red-500" 
            : "border-input",
          disabled && "opacity-50 cursor-not-allowed",
          selectedDate ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate text-left">
            {displayText}
          </span>
        </div>
        {selectedDate && !disabled && (
          <X
            className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
            onClick={handleClear}
          />
        )}
      </button>

      {error && (
        <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && position && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: position.vertical === 'top' ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position.vertical === 'top' ? 10 : -10, scale: 0.95 }}
              className={cn(
                "absolute z-20 bg-card border border-border rounded-[8px] shadow-lg p-4",
                position.vertical === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
                position.horizontal === 'right' ? 'right-0' : 'left-0',
                "w-[min(320px,calc(100vw-32px))]"
              )}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                      setCurrentMonth(prevMonth);
                    }}
                    className="p-1 hover:bg-accent rounded-[8px] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-sm text-foreground">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                      setCurrentMonth(nextMonth);
                    }}
                    className="p-1 hover:bg-accent rounded-[8px] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
                {days.map((date, idx) => {
                  if (!date) {
                    return <div key={idx} className="aspect-square" />;
                  }

                  const isSelected = isDateSelected(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      className={cn(
                        "aspect-square rounded-[8px] text-sm font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-accent text-foreground font-bold"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

