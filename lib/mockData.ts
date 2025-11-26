// Mock Data for the HRMS System

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatar?: string;
  salary: number;
  location: string;
  manager: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  hours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Processed' | 'Pending' | 'Paid';
  payPeriod: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  rating: number;
  goals: string[];
  achievements: string[];
  feedback: string;
  reviewer: string;
}

export const employees: Employee[] = [
  {
    id: 'E001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 234-567-8901',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    status: 'Active',
    joinDate: '2022-01-15',
    salary: 95000,
    location: 'San Francisco, CA',
    manager: 'John Smith',
  },
  {
    id: 'E002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 234-567-8902',
    department: 'Engineering',
    designation: 'Frontend Developer',
    status: 'Active',
    joinDate: '2022-03-20',
    salary: 82000,
    location: 'San Francisco, CA',
    manager: 'Sarah Johnson',
  },
  {
    id: 'E003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    phone: '+1 234-567-8903',
    department: 'Human Resources',
    designation: 'HR Manager',
    status: 'Active',
    joinDate: '2021-06-10',
    salary: 78000,
    location: 'New York, NY',
    manager: 'David Wilson',
  },
  {
    id: 'E004',
    name: 'James Anderson',
    email: 'james.anderson@company.com',
    phone: '+1 234-567-8904',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    status: 'Active',
    joinDate: '2022-09-01',
    salary: 68000,
    location: 'Los Angeles, CA',
    manager: 'Lisa Martinez',
  },
  {
    id: 'E005',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@company.com',
    phone: '+1 234-567-8905',
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'Active',
    joinDate: '2023-01-15',
    salary: 72000,
    location: 'Chicago, IL',
    manager: 'Robert Brown',
  },
  {
    id: 'E006',
    name: 'David Kim',
    email: 'david.kim@company.com',
    phone: '+1 234-567-8906',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    status: 'Active',
    joinDate: '2022-11-20',
    salary: 88000,
    location: 'Austin, TX',
    manager: 'John Smith',
  },
  {
    id: 'E007',
    name: 'Amanda White',
    email: 'amanda.white@company.com',
    phone: '+1 234-567-8907',
    department: 'Finance',
    designation: 'Financial Analyst',
    status: 'Active',
    joinDate: '2022-05-15',
    salary: 75000,
    location: 'New York, NY',
    manager: 'Thomas Lee',
  },
  {
    id: 'E008',
    name: 'Christopher Lee',
    email: 'christopher.lee@company.com',
    phone: '+1 234-567-8908',
    department: 'Operations',
    designation: 'Operations Manager',
    status: 'Active',
    joinDate: '2021-08-10',
    salary: 85000,
    location: 'Seattle, WA',
    manager: 'David Wilson',
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'A001',
    employeeId: 'E001',
    employeeName: 'Sarah Johnson',
    date: '2024-11-10',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    status: 'Present',
    hours: 9,
  },
  {
    id: 'A002',
    employeeId: 'E002',
    employeeName: 'Michael Chen',
    date: '2024-11-10',
    checkIn: '09:15 AM',
    checkOut: '06:15 PM',
    status: 'Late',
    hours: 9,
  },
  {
    id: 'A003',
    employeeId: 'E003',
    employeeName: 'Emily Rodriguez',
    date: '2024-11-10',
    checkIn: '08:45 AM',
    checkOut: '05:45 PM',
    status: 'Present',
    hours: 9,
  },
  {
    id: 'A004',
    employeeId: 'E004',
    employeeName: 'James Anderson',
    date: '2024-11-10',
    checkIn: '09:00 AM',
    checkOut: '01:00 PM',
    status: 'Half Day',
    hours: 4,
  },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'L001',
    employeeId: 'E001',
    employeeName: 'Sarah Johnson',
    leaveType: 'Casual Leave',
    startDate: '2024-11-15',
    endDate: '2024-11-17',
    days: 3,
    reason: 'Personal work',
    status: 'Approved',
    appliedOn: '2024-11-01',
  },
  {
    id: 'L002',
    employeeId: 'E002',
    employeeName: 'Michael Chen',
    leaveType: 'Sick Leave',
    startDate: '2024-11-12',
    endDate: '2024-11-12',
    days: 1,
    reason: 'Not feeling well',
    status: 'Pending',
    appliedOn: '2024-11-10',
  },
  {
    id: 'L003',
    employeeId: 'E005',
    employeeName: 'Jessica Taylor',
    leaveType: 'Annual Leave',
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    days: 12,
    reason: 'Year-end vacation',
    status: 'Approved',
    appliedOn: '2024-10-15',
  },
];

export const payrollRecords: PayrollRecord[] = [
  {
    id: 'P001',
    employeeId: 'E001',
    employeeName: 'Sarah Johnson',
    basicSalary: 95000,
    allowances: 5000,
    deductions: 8000,
    netSalary: 92000,
    status: 'Paid',
    payPeriod: 'October 2024',
  },
  {
    id: 'P002',
    employeeId: 'E002',
    employeeName: 'Michael Chen',
    basicSalary: 82000,
    allowances: 4000,
    deductions: 6500,
    netSalary: 79500,
    status: 'Paid',
    payPeriod: 'October 2024',
  },
  {
    id: 'P003',
    employeeId: 'E003',
    employeeName: 'Emily Rodriguez',
    basicSalary: 78000,
    allowances: 3500,
    deductions: 6000,
    netSalary: 75500,
    status: 'Processed',
    payPeriod: 'November 2024',
  },
];

export const performanceReviews: PerformanceReview[] = [
  {
    id: 'PR001',
    employeeId: 'E001',
    employeeName: 'Sarah Johnson',
    reviewPeriod: 'Q3 2024',
    rating: 4.5,
    goals: ['Lead team project', 'Mentor junior developers', 'Improve code quality'],
    achievements: ['Successfully led 2 major projects', 'Mentored 3 developers', 'Reduced bugs by 30%'],
    feedback: 'Excellent performance. Strong technical skills and leadership qualities.',
    reviewer: 'John Smith',
  },
  {
    id: 'PR002',
    employeeId: 'E002',
    employeeName: 'Michael Chen',
    reviewPeriod: 'Q3 2024',
    rating: 4.0,
    goals: ['Complete frontend redesign', 'Learn new framework', 'Improve testing'],
    achievements: ['Redesigned 5 major pages', 'Completed React certification', 'Increased test coverage to 85%'],
    feedback: 'Great progress. Keep up the good work on testing and code quality.',
    reviewer: 'Sarah Johnson',
  },
];

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Regional' | 'Company' | 'Religious';
  isRecurring: boolean;
}

export interface EmployeeOnLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  avatar?: string;
}

export interface EmployeeWorkingRemotely {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  location: string;
  checkInTime: string;
  status: 'Active' | 'On Break';
  avatar?: string;
}

export const holidays: Holiday[] = [
  { id: 'H001', name: 'Thanksgiving', date: '2024-11-28', type: 'National', isRecurring: true },
  { id: 'H002', name: 'Christmas', date: '2024-12-25', type: 'National', isRecurring: true },
  { id: 'H003', name: 'New Year', date: '2025-01-01', type: 'National', isRecurring: true },
  { id: 'H004', name: 'Independence Day', date: '2025-07-04', type: 'National', isRecurring: true },
  { id: 'H005', name: 'Labor Day', date: '2025-09-01', type: 'National', isRecurring: true },
  { id: 'H006', name: 'Company Foundation Day', date: '2025-03-15', type: 'Company', isRecurring: true },
  { id: 'H007', name: 'Diwali', date: '2024-11-01', type: 'Religious', isRecurring: false },
  { id: 'H008', name: 'Eid', date: '2025-03-10', type: 'Religious', isRecurring: false },
];

export const birthdays = [
  { name: 'Sarah Johnson', date: '2024-11-15' },
  { name: 'David Kim', date: '2024-11-20' },
];

// Employees on leave today
export const employeesOnLeaveToday: EmployeeOnLeave[] = [
  {
    id: 'OL001',
    employeeId: 'E002',
    employeeName: 'Michael Chen',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    startDate: '2024-11-12',
    endDate: '2024-11-12',
    days: 1,
    reason: 'Not feeling well',
  },
  {
    id: 'OL002',
    employeeId: 'E004',
    employeeName: 'James Anderson',
    department: 'Marketing',
    leaveType: 'Casual Leave',
    startDate: '2024-11-12',
    endDate: '2024-11-12',
    days: 1,
    reason: 'Personal work',
  },
  {
    id: 'OL003',
    employeeId: 'E007',
    employeeName: 'Amanda White',
    department: 'Finance',
    leaveType: 'Annual Leave',
    startDate: '2024-11-10',
    endDate: '2024-11-15',
    days: 4,
    reason: 'Vacation',
  },
];

// Employees working remotely today
export const employeesWorkingRemotely: EmployeeWorkingRemotely[] = [
  {
    id: 'WR001',
    employeeId: 'E001',
    employeeName: 'Sarah Johnson',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    checkInTime: '09:00 AM',
    status: 'Active',
  },
  {
    id: 'WR002',
    employeeId: 'E003',
    employeeName: 'Emily Rodriguez',
    department: 'Human Resources',
    designation: 'HR Manager',
    location: 'New York, NY',
    checkInTime: '08:45 AM',
    status: 'Active',
  },
  {
    id: 'WR003',
    employeeId: 'E005',
    employeeName: 'Jessica Taylor',
    department: 'Sales',
    designation: 'Sales Executive',
    location: 'Chicago, IL',
    checkInTime: '09:15 AM',
    status: 'Active',
  },
  {
    id: 'WR004',
    employeeId: 'E006',
    employeeName: 'David Kim',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    location: 'Austin, TX',
    checkInTime: '09:30 AM',
    status: 'On Break',
  },
  {
    id: 'WR005',
    employeeId: 'E008',
    employeeName: 'Christopher Lee',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Seattle, WA',
    checkInTime: '08:30 AM',
    status: 'Active',
  },
];

export const departments = [
  'All Departments',
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

export const designations = [
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'HR Manager',
  'HR Executive',
  'Marketing Manager',
  'Marketing Specialist',
  'Sales Executive',
  'Sales Manager',
  'Financial Analyst',
  'Operations Manager',
];

export const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Annual Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Unpaid Leave',
];

