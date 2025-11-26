// Attendance Storage Utility
// Manages attendance records in localStorage

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'WFH' | 'Partial Day';
  hours: number;
  location?: string;
  regularizationRequested?: boolean;
  regularizationStatus?: 'Pending' | 'Approved' | 'Rejected';
  regularizationReason?: string;
}

const STORAGE_KEY = 'hrms_attendance';

// Initialize with default attendance records if storage is empty
const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'A001',
    employeeId: '1',
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@inheritx.com',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    status: 'Present',
    hours: 9,
    location: 'Office',
  },
];

export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') {
    return DEFAULT_ATTENDANCE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    setAttendanceRecords(DEFAULT_ATTENDANCE);
    return DEFAULT_ATTENDANCE;
  } catch (error) {
    console.error('Error reading attendance from storage:', error);
    return DEFAULT_ATTENDANCE;
  }
}

export function setAttendanceRecords(records: AttendanceRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving attendance to storage:', error);
  }
}

export function addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
  const records = getAttendanceRecords();
  
  const maxId = records.reduce((max, rec) => {
    const numId = parseInt(rec.id.replace('A', '')) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newRecord: AttendanceRecord = {
    ...record,
    id: `A${String(maxId + 1).padStart(3, '0')}`,
  };

  records.push(newRecord);
  setAttendanceRecords(records);
  
  return newRecord;
}

export function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
  const records = getAttendanceRecords();
  const index = records.findIndex(rec => rec.id === id);
  
  if (index === -1) {
    return null;
  }

  records[index] = { ...records[index], ...updates };
  setAttendanceRecords(records);
  
  return records[index];
}

export function deleteAttendanceRecord(id: string): boolean {
  const records = getAttendanceRecords();
  const filtered = records.filter(rec => rec.id !== id);
  
  if (filtered.length === records.length) {
    return false;
  }

  setAttendanceRecords(filtered);
  return true;
}

export function getAttendanceByEmployeeId(employeeId: string): AttendanceRecord[] {
  const records = getAttendanceRecords();
  return records.filter(rec => rec.employeeId === employeeId);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  const records = getAttendanceRecords();
  return records.filter(rec => rec.date === date);
}

export function getAttendanceByEmployeeAndDate(employeeId: string, date: string): AttendanceRecord | null {
  const records = getAttendanceRecords();
  return records.find(rec => rec.employeeId === employeeId && rec.date === date) || null;
}

