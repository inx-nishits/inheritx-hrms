# Storage System Documentation

This folder contains all storage utilities for the HRMS system. All storage operations use localStorage for persistence.

## Structure

```
lib/storage/
├── index.ts                 # Centralized exports
├── employeeStorage.ts        # Employee management
├── attendanceStorage.ts      # Attendance records
├── leaveStorage.ts           # Leave requests
├── payrollStorage.ts         # Payroll records
├── holidayStorage.ts         # Holidays
└── departmentStorage.ts      # Departments
```

## Usage

### Import from centralized location

```typescript
import { 
  getEmployees, 
  addEmployee,
  getLeaveRequests,
  addLeaveRequest,
  // ... etc
} from '@/lib/storage';
```

## Storage Files

### 1. Employee Storage (`employeeStorage.ts`)

**Interface:** `StoredEmployee`

**Functions:**
- `getEmployees()` - Get all employees
- `addEmployee(employee)` - Add new employee
- `updateEmployee(id, updates)` - Update employee
- `deleteEmployee(id)` - Delete employee
- `getEmployeeById(id)` - Get employee by ID
- `getEmployeeByEmail(email)` - Get employee by email

**Role-based Access:**
- HR: Can view/manage all employees
- Employee: Can only view themselves (filtered by email)

### 2. Attendance Storage (`attendanceStorage.ts`)

**Interface:** `AttendanceRecord`

**Functions:**
- `getAttendanceRecords()` - Get all attendance records
- `addAttendanceRecord(record)` - Add new attendance record
- `updateAttendanceRecord(id, updates)` - Update attendance record
- `deleteAttendanceRecord(id)` - Delete attendance record
- `getAttendanceByEmployeeId(employeeId)` - Get attendance for specific employee
- `getAttendanceByDate(date)` - Get attendance for specific date
- `getAttendanceByEmployeeAndDate(employeeId, date)` - Get specific record

**Role-based Access:**
- HR: Can view/manage all attendance records
- Employee: Can only view their own attendance records

### 3. Leave Storage (`leaveStorage.ts`)

**Interface:** `LeaveRequest`

**Functions:**
- `getLeaveRequests()` - Get all leave requests
- `addLeaveRequest(leave)` - Add new leave request
- `updateLeaveRequest(id, updates)` - Update leave request
- `approveLeaveRequest(id, approvedBy)` - Approve leave request
- `rejectLeaveRequest(id, rejectedReason)` - Reject leave request
- `deleteLeaveRequest(id)` - Delete leave request
- `getLeaveByEmployeeId(employeeId)` - Get leaves for specific employee
- `getPendingLeaves()` - Get all pending leave requests
- `getLeaveById(id)` - Get leave by ID

**Role-based Access:**
- HR: Can view/manage all leave requests, approve/reject
- Employee: Can view their own leave requests, create new requests

### 4. Payroll Storage (`payrollStorage.ts`)

**Interface:** `PayrollRecord`

**Functions:**
- `getPayrollRecords()` - Get all payroll records
- `addPayrollRecord(record)` - Add new payroll record
- `updatePayrollRecord(id, updates)` - Update payroll record
- `deletePayrollRecord(id)` - Delete payroll record
- `getPayrollByEmployeeId(employeeId)` - Get payroll for specific employee
- `getPayrollByPeriod(payPeriod)` - Get payroll for specific period
- `getPayrollById(id)` - Get payroll by ID

**Role-based Access:**
- HR: Can view/manage all payroll records
- Employee: Can only view their own payroll records

### 5. Holiday Storage (`holidayStorage.ts`)

**Interface:** `Holiday`

**Functions:**
- `getHolidays()` - Get all holidays
- `addHoliday(holiday)` - Add new holiday
- `updateHoliday(id, updates)` - Update holiday
- `deleteHoliday(id)` - Delete holiday
- `getHolidayById(id)` - Get holiday by ID
- `getHolidaysByYear(year)` - Get holidays for specific year
- `getHolidaysByType(type)` - Get holidays by type

**Role-based Access:**
- HR: Can view/manage all holidays
- Employee: Can view all holidays (read-only)

### 6. Department Storage (`departmentStorage.ts`)

**Interface:** `Department`

**Functions:**
- `getDepartments()` - Get all departments
- `addDepartment(department)` - Add new department
- `updateDepartment(id, updates)` - Update department
- `deleteDepartment(id)` - Delete department
- `getDepartmentById(id)` - Get department by ID
- `getDepartmentByName(name)` - Get department by name
- `updateDepartmentEmployeeCount(departmentName, count)` - Update employee count

**Role-based Access:**
- HR: Can view/manage all departments
- Employee: Can view all departments (read-only)

## Role-Based Data Filtering

All storage functions return data, but you should filter based on user role:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getLeaveRequests, getLeaveByEmployeeId } from '@/lib/storage';

function MyComponent() {
  const { user } = useAuth();
  
  // HR sees all, Employee sees only their own
  const leaves = user?.role === 'hr' 
    ? getLeaveRequests()
    : getLeaveByEmployeeId(user?.id || '');
}
```

## Best Practices

1. **Always import from `@/lib/storage`** - Don't import directly from individual files
2. **Filter data by role** - Use role checks before displaying data
3. **Handle errors** - Storage operations can fail, always handle errors
4. **Refresh on navigation** - Use useEffect to refresh data when page becomes visible
5. **Type safety** - Use TypeScript interfaces for type safety

## Example: Adding a Leave Request

```typescript
import { addLeaveRequest } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeByEmail } from '@/lib/storage';

function LeaveRequestForm() {
  const { user } = useAuth();
  
  const handleSubmit = (formData) => {
    const employee = getEmployeeByEmail(user?.email || '');
    
    if (employee) {
      addLeaveRequest({
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        reason: formData.reason,
      });
    }
  };
}
```

## Storage Keys

All storage uses the following keys in localStorage:
- `hrms_employees` - Employee data
- `hrms_attendance` - Attendance records
- `hrms_leaves` - Leave requests
- `hrms_payroll` - Payroll records
- `hrms_holidays` - Holidays
- `hrms_departments` - Departments

