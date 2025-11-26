# Role-Based Access Control (RBAC) Documentation

## Overview

This document provides a comprehensive mapping of all features, modules, and access controls for the InheritX HRMS system. The system supports two primary roles: **Employee** and **HR/Admin**.

---

## Role Definitions

### Employee Role
- **Purpose**: Standard employee access with limited permissions
- **Access Scope**: Can only view, update, or edit their own data
- **Restrictions**: Cannot access or modify organization-wide settings or other employees' data

### HR/Admin Role
- **Purpose**: Full administrative access to all organizational modules
- **Access Scope**: Can create, edit, review, approve, and manage all organizational data
- **Responsibilities**: Approvals, reporting, analytics, and system configuration

---

## Feature Mapping by Role

### 1. Dashboard

#### Employee Access (`/`)
- ✅ View personal dashboard
- ✅ View own attendance summary
- ✅ View own leave balances
- ✅ View pending leave requests (own)
- ✅ View recent activity
- ✅ Quick actions (Clock In/Out, Request WFH, Request Leave)

#### HR Access (`/`)
- ✅ View organization-wide dashboard
- ✅ View all employees statistics
- ✅ View pending leave requests (all employees)
- ✅ View attendance alerts
- ✅ View payroll status
- ✅ Quick actions (Add Employee, Process Payroll, View Reports, Manage Settings)

**Route Protection**: Both roles can access, but see different content based on role.

---

### 2. Profile Management

#### Employee Access (`/employees/profile`)
- ✅ View own profile
- ✅ Edit limited fields:
  - Basic/Personal Details (Name, DOB, Nationality, etc.)
  - Contact Details (Mobile Number)
  - Work Location (City) - for remote employees
- ❌ Cannot edit:
  - Employee Number
  - Reporting Manager (can request change)
  - Job Title (can request change)
  - Department, Location, etc. (HR managed)
  - Compensation details (HR managed)
- ✅ View read-only employment details
- ✅ View read-only compensation (if enabled)

**Permission**: `view_own_profile`, `edit_own_profile`

#### HR Access (`/hr/employees`)
- ✅ View all employee profiles
- ✅ Edit all employee fields
- ✅ Add new employees
- ✅ Manage employee data
- ✅ Update compensation
- ✅ Update employment details

**Permission**: `view_all_employees`, `manage_employees`, `add_employee`, `edit_employee`

---

### 3. Attendance Management

#### Employee Access (`/employees/attendance`)
- ✅ View own attendance records
- ✅ View attendance statistics (own data only)
- ✅ Request Work From Home (WFH)
- ✅ Request Partial Day
- ✅ Request Attendance Regularization
- ✅ View attendance requests status
- ✅ Export own attendance data
- ❌ Cannot view other employees' attendance
- ❌ Cannot approve/reject attendance requests

**Permissions**: 
- `view_own_attendance`
- `regularize_attendance`
- `request_wfh`
- `request_partial_day`

#### HR Access (`/hr/attendance`)
- ✅ View all employees' attendance
- ✅ View attendance statistics (organization-wide)
- ✅ Approve/Reject attendance regularization requests
- ✅ Manage attendance policies
- ✅ View attendance reports
- ✅ Export attendance data
- ✅ View attendance alerts
- ✅ Regularize attendance for any employee

**Permissions**:
- `view_all_attendance`
- `manage_attendance`
- `regularize_attendance`

**Sub-modules**:
- `/hr/attendance/regularization` - Manage regularization requests
- `/hr/attendance/reports` - View attendance reports

---

### 4. Leave Management

#### Employee Access (`/employees/leave`)
- ✅ View own leave balances
- ✅ Request leave
- ✅ View leave history (own)
- ✅ Request leave encashment
- ✅ View compensatory off history
- ✅ View leave policies (read-only)
- ✅ Cancel own leave requests (if pending)
- ❌ Cannot approve/reject leaves
- ❌ Cannot view other employees' leaves

**Permissions**:
- `view_own_leaves`
- `request_leaves`

**Flow**: Employee requests leave → HR receives notification → HR approves/rejects

#### HR Access (`/hr/leave`)
- ✅ View all leave requests
- ✅ Approve/Reject leave requests
- ✅ View all employees' leave balances
- ✅ View leave history (all employees)
- ✅ Manage leave policies
- ✅ View leave reports
- ✅ Export leave data

**Permissions**:
- `view_all_leaves`
- `approve_leaves`
- `reject_leaves`
- `manage_leave_policies`

**Sub-modules**:
- `/hr/leave/pending` - Pending leave requests
- `/hr/leave/all` - All leave history
- `/hr/leave/policies` - Manage leave policies

**Flow**: Employee requests → HR reviews → HR approves/rejects → Employee notified

---

### 5. Payroll Management

#### Employee Access (`/employees/finances`)
- ✅ View own payslips
- ✅ View salary summary
- ✅ View tax information (own)
- ✅ Download payslips
- ❌ Cannot view other employees' payroll
- ❌ Cannot process payroll
- ❌ Cannot modify salary structure

**Permissions**:
- `view_own_payroll`

**Sub-modules**:
- `/employees/finances/summary` - Salary summary
- `/employees/finances/pay` - Payslips
- `/employees/finances/tax` - Tax information

#### HR Access (`/hr/payroll`)
- ✅ View all employees' payroll
- ✅ Process payroll
- ✅ Manage salary structures
- ✅ Generate payroll reports
- ✅ Export payroll data
- ✅ Update employee compensation

**Permissions**:
- `view_all_payroll`
- `manage_payroll`
- `process_payroll`

**Sub-modules**:
- `/hr/payroll/process` - Process payroll
- `/hr/payroll/salary` - Salary structure management

---

### 6. Employee Management

#### Employee Access
- ❌ Cannot access employee management
- ✅ Can only view own profile

#### HR Access (`/hr/employees`)
- ✅ View all employees
- ✅ Add new employees
- ✅ Edit employee details
- ✅ Manage employee status (Active/Inactive)
- ✅ View employee reports

**Permissions**:
- `view_all_employees`
- `manage_employees`
- `add_employee`
- `edit_employee`

**Sub-modules**:
- `/hr/employees` - All employees list
- `/hr/employees/add` - Add new employee

---

### 7. Department Management

#### Employee Access
- ❌ Cannot access department management
- ✅ Can view organization structure (read-only via `/employees/profile`)

#### HR Access (`/hr/departments`)
- ✅ View all departments
- ✅ Create departments
- ✅ Edit departments
- ✅ Manage department hierarchy
- ✅ Assign employees to departments

**Permission**: `manage_departments`

---

### 8. Organization Management

#### Employee Access
- ✅ View organization overview (read-only)
- ❌ Cannot modify organization settings

**Permission**: `view_organization`

#### HR Access (`/hr/organization`)
- ✅ View organization structure
- ✅ Manage organization settings
- ✅ Update company information
- ✅ Manage locations
- ✅ Manage business units

**Permissions**:
- `view_organization`
- `manage_organization`

---

### 9. Reports

#### Employee Access
- ❌ Cannot access reports module
- ✅ Can export own data (attendance, leave, payroll)

#### HR Access (`/hr/reports`)
- ✅ View all reports
- ✅ Generate custom reports
- ✅ Export reports
- ✅ View analytics and insights

**Permissions**:
- `view_reports`
- `export_reports`

---

### 10. Settings

#### Employee Access
- ❌ Cannot access settings
- ✅ Can update own profile settings

#### HR Access (`/hr/settings`)
- ✅ Manage system settings
- ✅ Manage policies
- ✅ Configure attendance policies
- ✅ Configure leave policies
- ✅ Manage user roles and permissions

**Permissions**:
- `manage_settings`
- `manage_policies`

---

### 11. Onboarding

#### Employee Access
- ✅ View own onboarding status
- ✅ Complete onboarding tasks assigned to them

#### HR Access (`/hr/onboarding`)
- ✅ Manage onboarding workflows
- ✅ Assign onboarding tasks
- ✅ Track onboarding progress
- ✅ Configure onboarding templates

**Permission**: `manage_onboarding`

---

### 12. Inbox

#### Employee Access (`/employees/inbox`)
- ✅ View own notifications
- ✅ View leave request status updates
- ✅ View attendance request status updates
- ✅ View general notifications

**Permission**: `view_inbox`

#### HR Access (`/hr/inbox`)
- ✅ View all notifications
- ✅ Manage notifications
- ✅ Send notifications to employees
- ✅ View approval requests

**Permissions**:
- `view_inbox`
- `manage_inbox`

---

## Data Access Rules

### Employee Data Filtering
- **Own Data Only**: Employees can only view/edit their own:
  - Attendance records
  - Leave requests and balances
  - Payroll information
  - Profile information
- **No Cross-Access**: Employees cannot access other employees' data, even if they know the ID
- **Read-Only Organization**: Employees can view organization structure but cannot modify

### HR Data Access
- **Full Access**: HR can view and manage all employees' data
- **Organization-Wide**: HR can view organization-wide statistics and reports
- **Administrative**: HR can modify system settings and policies

---

## Permission System

### Permission Constants
All permissions are defined in `lib/auth.ts` under `PERMISSIONS` object.

### Permission Checks
- **Frontend**: Use `hasPermission(userRole, permission)` from `lib/auth.ts`
- **Route Protection**: Use `ProtectedRoute` component with `requiredPermission` prop
- **Data Filtering**: Use `filterDataByRole()` utility function

### Example Usage

```typescript
import { hasPermission, PERMISSIONS } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  if (hasPermission(user?.role || null, PERMISSIONS.APPROVE_LEAVES)) {
    // Show approve button
  }
}
```

---

## Route Protection

### Layout-Level Protection
- `/employees/*` - Protected by `EmployeesLayout` (employee role only)
- `/hr/*` - Protected by `HRLayout` (hr role only)

### Page-Level Protection
Each page uses `ProtectedRoute` component:
```tsx
<ProtectedRoute allowedRoles={['employee']}>
  <PageContent />
</ProtectedRoute>
```

### Permission-Based Protection
```tsx
<ProtectedRoute 
  allowedRoles={['hr']} 
  requiredPermission={PERMISSIONS.APPROVE_LEAVES}
>
  <PageContent />
</ProtectedRoute>
```

---

## API Protection (Future Implementation)

When API routes are implemented, use `validateApiAccess()`:

```typescript
import { validateApiAccess, PERMISSIONS } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  const validation = validateApiAccess(
    user,
    PERMISSIONS.VIEW_ALL_EMPLOYEES,
    employeeId // Optional: for resource ownership check
  );
  
  if (!validation.allowed) {
    return new Response(validation.reason, { status: 403 });
  }
  
  // Proceed with API logic
}
```

---

## Feature Flow Examples

### Leave Request Flow
1. **Employee** requests leave via `/employees/leave`
2. Request saved with status "Pending"
3. **HR** receives notification in `/hr/inbox`
4. **HR** reviews request in `/hr/leave/pending`
5. **HR** approves/rejects request
6. **Employee** receives notification of decision
7. Leave balance updated automatically

### Attendance Regularization Flow
1. **Employee** notices missing/m incorrect attendance
2. **Employee** requests regularization via `/employees/attendance`
3. Request saved with status "Pending"
4. **HR** reviews request in `/hr/attendance/regularization`
5. **HR** approves/rejects with comments
6. **Employee** receives notification
7. Attendance record updated if approved

### Payroll Processing Flow
1. **HR** initiates payroll processing via `/hr/payroll/process`
2. System calculates salaries based on attendance and leaves
3. **HR** reviews and approves payroll
4. Payslips generated for all employees
5. **Employees** can view their payslips in `/employees/finances/pay`

---

## Security Considerations

1. **Frontend Protection**: UI elements hidden based on permissions, but not secure
2. **Backend Validation**: All API endpoints must validate permissions server-side
3. **Data Filtering**: Always filter data by role before sending to client
4. **Resource Ownership**: Employees can only access resources they own
5. **Audit Logging**: All sensitive actions should be logged (future implementation)

---

## Testing Checklist

See `QA_CHECKLIST.md` for comprehensive testing guidelines.

---

## Updates and Maintenance

- When adding new features, update this documentation
- Add new permissions to `PERMISSIONS` constant in `lib/auth.ts`
- Update role permissions in `ROLE_PERMISSIONS` object
- Test both employee and HR access for new features
- Update route protection as needed

---

**Last Updated**: November 2025
**Version**: 1.0

