// Payroll Storage Utility
// Manages payroll records in localStorage

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Processed' | 'Pending' | 'Paid';
  payPeriod: string;
  payDate?: string;
  processedBy?: string;
  processedOn?: string;
}

const STORAGE_KEY = 'hrms_payroll';

// Initialize with default payroll records if storage is empty
const DEFAULT_PAYROLL: PayrollRecord[] = [
  {
    id: 'P001',
    employeeId: '1',
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@inheritx.com',
    basicSalary: 95000,
    allowances: 5000,
    deductions: 8000,
    netSalary: 92000,
    status: 'Paid',
    payPeriod: 'October 2024',
  },
];

export function getPayrollRecords(): PayrollRecord[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PAYROLL;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    setPayrollRecords(DEFAULT_PAYROLL);
    return DEFAULT_PAYROLL;
  } catch (error) {
    console.error('Error reading payroll from storage:', error);
    return DEFAULT_PAYROLL;
  }
}

export function setPayrollRecords(records: PayrollRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving payroll to storage:', error);
  }
}

export function addPayrollRecord(record: Omit<PayrollRecord, 'id'>): PayrollRecord {
  const records = getPayrollRecords();
  
  const maxId = records.reduce((max, rec) => {
    const numId = parseInt(rec.id.replace('P', '')) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newRecord: PayrollRecord = {
    ...record,
    id: `P${String(maxId + 1).padStart(3, '0')}`,
  };

  records.push(newRecord);
  setPayrollRecords(records);
  
  return newRecord;
}

export function updatePayrollRecord(id: string, updates: Partial<PayrollRecord>): PayrollRecord | null {
  const records = getPayrollRecords();
  const index = records.findIndex(rec => rec.id === id);
  
  if (index === -1) {
    return null;
  }

  records[index] = { ...records[index], ...updates };
  setPayrollRecords(records);
  
  return records[index];
}

export function deletePayrollRecord(id: string): boolean {
  const records = getPayrollRecords();
  const filtered = records.filter(rec => rec.id !== id);
  
  if (filtered.length === records.length) {
    return false;
  }

  setPayrollRecords(filtered);
  return true;
}

export function getPayrollByEmployeeId(employeeId: string): PayrollRecord[] {
  const records = getPayrollRecords();
  return records.filter(rec => rec.employeeId === employeeId);
}

export function getPayrollByPeriod(payPeriod: string): PayrollRecord[] {
  const records = getPayrollRecords();
  return records.filter(rec => rec.payPeriod === payPeriod);
}

export function getPayrollById(id: string): PayrollRecord | null {
  const records = getPayrollRecords();
  return records.find(rec => rec.id === id) || null;
}

