// Employee Storage Utility
// Manages employee data in localStorage

export interface StoredEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinDate: string;
  employeeId: string;
  workCountry: string;
  status: 'active' | 'inactive';
  avatar?: string;
  location?: string;
  manager?: string;
  salary?: number;
}

const STORAGE_KEY = 'hrms_employees';

// Initialize with default employees if storage is empty
const DEFAULT_EMPLOYEES: StoredEmployee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@inheritx.com',
    phone: '+1 234-567-8900',
    department: 'Engineering',
    designation: 'Senior Developer',
    joinDate: '2023-01-15',
    employeeId: 'EMP001',
    workCountry: 'United States',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@inheritx.com',
    phone: '+1 234-567-8901',
    department: 'Marketing',
    designation: 'Marketing Manager',
    joinDate: '2022-06-20',
    employeeId: 'EMP002',
    workCountry: 'United States',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@inheritx.com',
    phone: '+1 234-567-8902',
    department: 'Sales',
    designation: 'Sales Executive',
    joinDate: '2023-03-10',
    employeeId: 'EMP003',
    workCountry: 'United States',
    status: 'active',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@inheritx.com',
    phone: '+1 234-567-8903',
    department: 'HR',
    designation: 'HR Manager',
    joinDate: '2021-09-05',
    employeeId: 'EMP004',
    workCountry: 'United States',
    status: 'active',
  },
];

export function getEmployees(): StoredEmployee[] {
  if (typeof window === 'undefined') {
    return DEFAULT_EMPLOYEES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default employees
    setEmployees(DEFAULT_EMPLOYEES);
    return DEFAULT_EMPLOYEES;
  } catch (error) {
    console.error('Error reading employees from storage:', error);
    return DEFAULT_EMPLOYEES;
  }
}

export function setEmployees(employees: StoredEmployee[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees to storage:', error);
  }
}

export function addEmployee(employee: Omit<StoredEmployee, 'id' | 'status'>): StoredEmployee {
  const employees = getEmployees();
  
  // Generate ID
  const maxId = employees.reduce((max, emp) => {
    const numId = parseInt(emp.id) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newEmployee: StoredEmployee = {
    ...employee,
    id: String(maxId + 1),
    status: 'active',
    employeeId: employee.employeeId || `EMP${String(maxId + 1).padStart(3, '0')}`,
  };

  employees.push(newEmployee);
  setEmployees(employees);
  
  return newEmployee;
}

export function updateEmployee(id: string, updates: Partial<StoredEmployee>): StoredEmployee | null {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    return null;
  }

  employees[index] = { ...employees[index], ...updates };
  setEmployees(employees);
  
  return employees[index];
}

export function deleteEmployee(id: string): boolean {
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  
  if (filtered.length === employees.length) {
    return false; // Employee not found
  }

  setEmployees(filtered);
  return true;
}

export function getEmployeeById(id: string): StoredEmployee | null {
  const employees = getEmployees();
  return employees.find(emp => emp.id === id) || null;
}

export function getEmployeeByEmail(email: string): StoredEmployee | null {
  const employees = getEmployees();
  return employees.find(emp => emp.email.toLowerCase() === email.toLowerCase()) || null;
}

