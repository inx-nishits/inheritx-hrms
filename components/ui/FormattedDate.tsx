"use client";

import { useEffect, useState } from 'react';

interface FormattedDateProps {
  date: Date | string;
  format?: 'short' | 'long' | 'month-year';
  className?: string;
}

export function FormattedDate({ date, format = 'short', className }: FormattedDateProps) {
  const [isMounted, setIsMounted] = useState(false);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a consistent format during SSR
    const isoDate = dateObj.toISOString().split('T')[0];
    return <span className={className}>{isoDate}</span>;
  }

  let formatted: string;
  switch (format) {
    case 'long':
      formatted = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      break;
    case 'month-year':
      formatted = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      break;
    case 'short':
    default:
      formatted = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      break;
  }

  return <span className={className}>{formatted}</span>;
}

