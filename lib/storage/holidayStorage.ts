// Holiday Storage Utility
// Manages holidays in localStorage

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Regional' | 'Company' | 'Religious';
  isRecurring: boolean;
  description?: string;
}

const STORAGE_KEY = 'hrms_holidays';

// Initialize with default holidays if storage is empty
const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'H001', name: 'Thanksgiving', date: '2024-11-28', type: 'National', isRecurring: true },
  { id: 'H002', name: 'Christmas', date: '2024-12-25', type: 'National', isRecurring: true },
  { id: 'H003', name: 'New Year', date: '2025-01-01', type: 'National', isRecurring: true },
  { id: 'H004', name: 'Independence Day', date: '2025-07-04', type: 'National', isRecurring: true },
  { id: 'H005', name: 'Labor Day', date: '2025-09-01', type: 'National', isRecurring: true },
  { id: 'H006', name: 'Company Foundation Day', date: '2025-03-15', type: 'Company', isRecurring: true },
  { id: 'H007', name: 'Diwali', date: '2024-11-01', type: 'Religious', isRecurring: false },
  { id: 'H008', name: 'Eid', date: '2025-03-10', type: 'Religious', isRecurring: false },
];

export function getHolidays(): Holiday[] {
  if (typeof window === 'undefined') {
    return DEFAULT_HOLIDAYS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    setHolidays(DEFAULT_HOLIDAYS);
    return DEFAULT_HOLIDAYS;
  } catch (error) {
    console.error('Error reading holidays from storage:', error);
    return DEFAULT_HOLIDAYS;
  }
}

export function setHolidays(holidays: Holiday[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  } catch (error) {
    console.error('Error saving holidays to storage:', error);
  }
}

export function addHoliday(holiday: Omit<Holiday, 'id'>): Holiday {
  const holidays = getHolidays();
  
  const maxId = holidays.reduce((max, h) => {
    const numId = parseInt(h.id.replace('H', '')) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newHoliday: Holiday = {
    ...holiday,
    id: `H${String(maxId + 1).padStart(3, '0')}`,
  };

  holidays.push(newHoliday);
  setHolidays(holidays);
  
  return newHoliday;
}

export function updateHoliday(id: string, updates: Partial<Holiday>): Holiday | null {
  const holidays = getHolidays();
  const index = holidays.findIndex(h => h.id === id);
  
  if (index === -1) {
    return null;
  }

  holidays[index] = { ...holidays[index], ...updates };
  setHolidays(holidays);
  
  return holidays[index];
}

export function deleteHoliday(id: string): boolean {
  const holidays = getHolidays();
  const filtered = holidays.filter(h => h.id !== id);
  
  if (filtered.length === holidays.length) {
    return false;
  }

  setHolidays(filtered);
  return true;
}

export function getHolidayById(id: string): Holiday | null {
  const holidays = getHolidays();
  return holidays.find(h => h.id === id) || null;
}

export function getHolidaysByYear(year: number): Holiday[] {
  const holidays = getHolidays();
  return holidays.filter(h => {
    const holidayYear = new Date(h.date).getFullYear();
    return holidayYear === year;
  });
}

export function getHolidaysByType(type: Holiday['type']): Holiday[] {
  const holidays = getHolidays();
  return holidays.filter(h => h.type === type);
}

