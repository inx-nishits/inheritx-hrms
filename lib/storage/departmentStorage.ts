// Department Storage Utility
// Manages departments in localStorage

export interface Department {
  id: string;
  name: string;
  description?: string;
  head?: string;
  headEmail?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'hrms_departments';

// Initialize with default departments if storage is empty
const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'D001',
    name: 'Engineering',
    description: 'Software development and engineering',
    head: 'John Smith',
    headEmail: 'john.smith@inheritx.com',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'D002',
    name: 'Marketing',
    description: 'Marketing and communications',
    head: 'Jane Smith',
    headEmail: 'jane.smith@inheritx.com',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'D003',
    name: 'Sales',
    description: 'Sales and business development',
    head: 'Mike Johnson',
    headEmail: 'mike.johnson@inheritx.com',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'D004',
    name: 'HR',
    description: 'Human Resources',
    head: 'Sarah Williams',
    headEmail: 'sarah.williams@inheritx.com',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'D005',
    name: 'Finance',
    description: 'Finance and accounting',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'D006',
    name: 'Operations',
    description: 'Operations management',
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getDepartments(): Department[] {
  if (typeof window === 'undefined') {
    return DEFAULT_DEPARTMENTS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    setDepartments(DEFAULT_DEPARTMENTS);
    return DEFAULT_DEPARTMENTS;
  } catch (error) {
    console.error('Error reading departments from storage:', error);
    return DEFAULT_DEPARTMENTS;
  }
}

export function setDepartments(departments: Department[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
  } catch (error) {
    console.error('Error saving departments to storage:', error);
  }
}

export function addDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'employeeCount'>): Department {
  const departments = getDepartments();
  
  const maxId = departments.reduce((max, dept) => {
    const numId = parseInt(dept.id.replace('D', '')) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newDepartment: Department = {
    ...department,
    id: `D${String(maxId + 1).padStart(3, '0')}`,
    employeeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  departments.push(newDepartment);
  setDepartments(departments);
  
  return newDepartment;
}

export function updateDepartment(id: string, updates: Partial<Department>): Department | null {
  const departments = getDepartments();
  const index = departments.findIndex(dept => dept.id === id);
  
  if (index === -1) {
    return null;
  }

  departments[index] = { 
    ...departments[index], 
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setDepartments(departments);
  
  return departments[index];
}

export function deleteDepartment(id: string): boolean {
  const departments = getDepartments();
  const filtered = departments.filter(dept => dept.id !== id);
  
  if (filtered.length === departments.length) {
    return false;
  }

  setDepartments(filtered);
  return true;
}

export function getDepartmentById(id: string): Department | null {
  const departments = getDepartments();
  return departments.find(dept => dept.id === id) || null;
}

export function getDepartmentByName(name: string): Department | null {
  const departments = getDepartments();
  return departments.find(dept => dept.name.toLowerCase() === name.toLowerCase()) || null;
}

export function updateDepartmentEmployeeCount(departmentName: string, count: number): void {
  const departments = getDepartments();
  const department = departments.find(dept => dept.name === departmentName);
  
  if (department) {
    updateDepartment(department.id, { employeeCount: count });
  }
}

