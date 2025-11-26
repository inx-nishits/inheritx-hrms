"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: { start?: Date; end?: Date };
  onChange?: (range: { start?: Date; end?: Date }) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(value?.start || null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(value?.end || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [position, setPosition] = useState<{ top?: number; left?: number; vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside the container
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use both mousedown and click for better coverage
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dynamic position when opening (for viewport-aware positioning)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const calculatePosition = () => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calendar dimensions (approximate)
        const calendarHeight = 380; // Height of calendar widget
        const calendarWidth = 320; // Width of calendar widget
        const padding = 8; // Minimum padding from viewport edges
        
        // Calculate available space in all directions
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        
        let vertical: 'top' | 'bottom' = 'bottom';
        let horizontal: 'left' | 'right' = 'left';
        
        // VERTICAL POSITIONING - Determine direction based on available space
        if (spaceBelow >= calendarHeight + padding) {
          // Enough space below - open downward
          vertical = 'bottom';
        } 
        // Check if we have enough space above (flip direction)
        else if (spaceAbove >= calendarHeight + padding) {
          // Not enough space below but enough above - flip upward
          vertical = 'top';
        } 
        // Neither side has enough space - use the side with MORE space
        else {
          vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';
        }
        
        // HORIZONTAL POSITIONING - Determine direction based on available space
        if (spaceRight >= calendarWidth + padding) {
          // Enough space on right - align to left edge of button
          horizontal = 'left';
        } 
        // Check if we have enough space on the left (flip direction)
        else if (spaceLeft >= calendarWidth + padding) {
          // Not enough space on right but enough on left - flip to left side
          horizontal = 'right';
        } 
        // Neither side has enough space - use the side with MORE space
        else {
          horizontal = spaceRight > spaceLeft ? 'left' : 'right';
        }
        
        setPosition({ vertical, horizontal });
      };

      calculatePosition();
      
      // Recalculate on resize (but not scroll, as absolute positioning moves with parent)
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
      };
    } else {
      setPosition(null);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    // Format as "Nov 3, 2025" - compact format that fits on one line
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateCompact = (date: Date) => {
    // More compact format: "Nov 3, 25" for better fit in filter options
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStart) return false;
    if (selectedEnd) {
      return date >= selectedStart && date <= selectedEnd;
    }
    if (hoverDate && selectedStart) {
      const start = date < selectedStart ? date : selectedStart;
      const end = date > selectedStart ? date : selectedStart;
      return hoverDate >= start && hoverDate <= end;
    }
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedStart) return false;
    if (date.toDateString() === selectedStart.toDateString()) return true;
    if (selectedEnd && date.toDateString() === selectedEnd.toDateString()) return true;
    return false;
  };

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      onChange?.({ start: selectedStart, end: selectedEnd });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    onChange?.({});
  };

  const days = getDaysInMonth(currentMonth);
  // Use full date format for display since we have more space in the new layout
  const displayText = selectedStart && selectedEnd
    ? `${formatDate(selectedStart)} - ${formatDate(selectedEnd)}`
    : selectedStart
    ? `${formatDate(selectedStart)} - ...`
    : 'Select date range';

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className || "w-full")}
      style={selectedStart && selectedEnd ? { 
        display: 'inline-block',
        width: '100%',
        minWidth: 'fit-content'
      } : {}}
    >
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 items-center justify-between rounded-[8px] border border-input bg-background px-3 py-2 text-sm font-medium",
          "focus:outline-none",
          "transition-all duration-200"
        )}
        style={selectedStart && selectedEnd ? { 
          width: 'max-content', 
          minWidth: '100%' 
        } : { 
          width: '100%' 
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className={cn(
            selectedStart ? "text-foreground" : "text-muted-foreground",
            "whitespace-nowrap"
          )}>
            {displayText}
          </span>
        </div>
        {selectedStart && (
          <X
            className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && position && (
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
                "absolute z-20 bg-card border border-border rounded-[8px] shadow-lg p-4 mt-2",
                position.vertical === 'top' ? 'bottom-full mb-2' : 'top-full',
                position.horizontal === 'right' ? 'right-0 mr-4' : 'left-0 ml-4',
                "w-[min(320px,calc(100vw-32px))]"
              )}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                      setCurrentMonth(prevMonth);
                    }}
                    className="p-1 hover:bg-accent rounded-[8px] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-sm">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
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
                  const inRange = isDateInRange(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={cn(
                        "aspect-square rounded-[8px] text-sm font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : inRange
                          ? "bg-primary/20 text-primary"
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

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  disabled={!selectedStart || !selectedEnd}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-[8px] text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

