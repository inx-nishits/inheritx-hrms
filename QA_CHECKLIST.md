# QA Checklist - Role-Based Access Control

## Overview
This checklist ensures proper role-based access control (RBAC) implementation across the HRMS system. Test each item with both **Employee** and **HR** roles.

---

## Authentication & Authorization

### Login & Access
- [ ] Employee can log in with employee credentials
- [ ] HR can log in with HR credentials
- [ ] Employee cannot log in with HR credentials
- [ ] HR cannot log in with employee credentials
- [ ] Unauthenticated users are redirected to login
- [ ] Authenticated users cannot access login page
- [ ] Session persists after page refresh
- [ ] Logout clears session and redirects to login

### Route Protection
- [ ] Employee cannot access `/hr/*` routes
- [ ] HR cannot access `/employees/*` routes (except own profile if applicable)
- [ ] Unauthenticated users cannot access protected routes
- [ ] Accessing unauthorized route redirects to dashboard
- [ ] Dashboard shows correct content based on role

---

## Employee Role Testing

### Dashboard (`/`)
- [ ] Shows employee-specific dashboard
- [ ] Displays own attendance summary
- [ ] Displays own leave balances
- [ ] Shows pending leave requests (own only)
- [ ] Quick actions visible (Clock In, WFH, Leave)
- [ ] No HR-specific statistics visible
- [ ] Cannot see other employees' data

### Profile (`/employees/profile`)
- [ ] Can view own profile
- [ ] Can edit basic/personal details
- [ ] Can edit contact details (mobile)
- [ ] Cannot edit employee number
- [ ] Cannot edit reporting manager (can request change)
- [ ] Cannot edit job title (can request change)
- [ ] Cannot edit department/location (read-only)
- [ ] Cannot edit compensation (read-only)
- [ ] Read-only fields show lock icon
- [ ] Save functionality works for editable fields

### Attendance (`/employees/attendance`)
- [ ] Can view own attendance records only
- [ ] Can view own attendance statistics
- [ ] Can request WFH
- [ ] Can request partial day
- [ ] Can request attendance regularization
- [ ] Cannot see other employees' attendance
- [ ] Cannot approve/reject attendance requests
- [ ] Export shows only own data
- [ ] Attendance log shows only own records

### Leave (`/employees/leave`)
- [ ] Can view own leave balances
- [ ] Can request leave
- [ ] Can view own leave history
- [ ] Can request leave encashment
- [ ] Can view compensatory off history
- [ ] Can view leave policies (read-only)
- [ ] Can cancel own pending leave requests
- [ ] Cannot approve/reject leaves
- [ ] Cannot view other employees' leaves
- [ ] Leave request creates notification for HR

### Finances (`/employees/finances`)
- [ ] Can view own payslips
- [ ] Can view own salary summary
- [ ] Can view own tax information
- [ ] Can download own payslips
- [ ] Cannot view other employees' payroll
- [ ] Cannot process payroll
- [ ] Cannot modify salary structure

### Inbox (`/employees/inbox`)
- [ ] Can view own notifications
- [ ] Can see leave request status updates
- [ ] Can see attendance request status updates
- [ ] Cannot see other employees' notifications

---

## HR Role Testing

### Dashboard (`/`)
- [ ] Shows HR-specific dashboard
- [ ] Displays organization-wide statistics
- [ ] Shows pending leave requests (all employees)
- [ ] Shows attendance alerts
- [ ] Shows payroll status
- [ ] Quick actions visible (Add Employee, Process Payroll, etc.)
- [ ] Can see all employees' data

### Employees (`/hr/employees`)
- [ ] Can view all employees
- [ ] Can add new employee
- [ ] Can edit any employee's details
- [ ] Can manage employee status
- [ ] Can view employee reports
- [ ] Search and filter works correctly
- [ ] Can access employee profile pages

### Leave Management (`/hr/leave`)
- [ ] Can view all leave requests
- [ ] Can approve leave requests
- [ ] Can reject leave requests
- [ ] Can view all employees' leave balances
- [ ] Can view all leave history
- [ ] Can manage leave policies
- [ ] Can export leave data
- [ ] Approval/rejection sends notification to employee

### Attendance (`/hr/attendance`)
- [ ] Can view all employees' attendance
- [ ] Can view organization-wide statistics
- [ ] Can approve/reject regularization requests
- [ ] Can regularize attendance for any employee
- [ ] Can view attendance reports
- [ ] Can export attendance data
- [ ] Can view attendance alerts
- [ ] Filter by department/employee works

### Payroll (`/hr/payroll`)
- [ ] Can view all employees' payroll
- [ ] Can process payroll
- [ ] Can manage salary structures
- [ ] Can generate payroll reports
- [ ] Can export payroll data
- [ ] Can update employee compensation
- [ ] Payroll processing calculates correctly

### Departments (`/hr/departments`)
- [ ] Can view all departments
- [ ] Can create departments
- [ ] Can edit departments
- [ ] Can manage department hierarchy
- [ ] Can assign employees to departments

### Organization (`/hr/organization`)
- [ ] Can view organization structure
- [ ] Can manage organization settings
- [ ] Can update company information
- [ ] Can manage locations
- [ ] Can manage business units

### Reports (`/hr/reports`)
- [ ] Can view all reports
- [ ] Can generate custom reports
- [ ] Can export reports
- [ ] Can view analytics and insights
- [ ] Reports show correct data

### Settings (`/hr/settings`)
- [ ] Can manage system settings
- [ ] Can manage policies
- [ ] Can configure attendance policies
- [ ] Can configure leave policies
- [ ] Settings save correctly

### Onboarding (`/hr/onboarding`)
- [ ] Can manage onboarding workflows
- [ ] Can assign onboarding tasks
- [ ] Can track onboarding progress
- [ ] Can configure onboarding templates

### Inbox (`/hr/inbox`)
- [ ] Can view all notifications
- [ ] Can manage notifications
- [ ] Can send notifications to employees
- [ ] Can view approval requests

---

## Data Security Testing

### Data Filtering
- [ ] Employee API calls only return own data
- [ ] HR API calls return all data
- [ ] Frontend filters data correctly by role
- [ ] Direct URL access to other employee's data is blocked
- [ ] Employee cannot access other employee's data by ID manipulation

### Permission Checks
- [ ] UI elements hidden based on permissions
- [ ] Actions disabled based on permissions
- [ ] Error messages shown for unauthorized actions
- [ ] Permission checks work on page load
- [ ] Permission checks work after role change

### Resource Ownership
- [ ] Employee can only edit own profile
- [ ] Employee can only view own attendance
- [ ] Employee can only view own leaves
- [ ] Employee can only view own payroll
- [ ] HR can access all resources

---

## Feature Flow Testing

### Leave Request Flow
- [ ] Employee can submit leave request
- [ ] Request appears in HR pending list
- [ ] HR receives notification
- [ ] HR can approve request
- [ ] Employee receives approval notification
- [ ] Leave balance updates correctly
- [ ] HR can reject request
- [ ] Employee receives rejection notification
- [ ] Rejection reason is visible to employee

### Attendance Regularization Flow
- [ ] Employee can request regularization
- [ ] Request appears in HR regularization list
- [ ] HR receives notification
- [ ] HR can approve request
- [ ] Attendance record updates correctly
- [ ] Employee receives notification
- [ ] HR can reject request
- [ ] Employee receives rejection notification

### Payroll Processing Flow
- [ ] HR can initiate payroll processing
- [ ] System calculates salaries correctly
- [ ] HR can review payroll
- [ ] HR can approve payroll
- [ ] Payslips generated for all employees
- [ ] Employees can view their payslips
- [ ] Payroll data is accurate

---

## UI/UX Testing

### Navigation
- [ ] Sidebar shows correct menu items for role
- [ ] Employee sidebar shows employee menu only
- [ ] HR sidebar shows HR menu only
- [ ] Menu items are clickable
- [ ] Active menu item is highlighted
- [ ] Breadcrumbs show correct path

### Visual Indicators
- [ ] Read-only fields show lock icon
- [ ] Disabled buttons are visually distinct
- [ ] Permission-based UI elements are hidden correctly
- [ ] Loading states work correctly
- [ ] Error messages are clear

### Responsive Design
- [ ] Mobile view works correctly
- [ ] Tablet view works correctly
- [ ] Desktop view works correctly
- [ ] Sidebar collapses on mobile
- [ ] Navigation works on all screen sizes

---

## Edge Cases

### Data Edge Cases
- [ ] Empty states display correctly
- [ ] No data messages are appropriate
- [ ] Large datasets load correctly
- [ ] Pagination works correctly
- [ ] Search/filter works with no results

### Permission Edge Cases
- [ ] User with no role cannot access anything
- [ ] Role change during session updates UI correctly
- [ ] Permission denied messages are clear
- [ ] Redirects work correctly on permission denial

### Session Edge Cases
- [ ] Session expiry redirects to login
- [ ] Multiple tabs maintain session
- [ ] Logout in one tab logs out all tabs
- [ ] Browser back button works correctly

---

## Performance Testing

- [ ] Page load times are acceptable
- [ ] Data filtering doesn't cause performance issues
- [ ] Large lists render correctly
- [ ] Search/filter is responsive
- [ ] No memory leaks on navigation

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Security Testing

### XSS Prevention
- [ ] User input is sanitized
- [ ] No script injection possible
- [ ] Special characters display correctly

### CSRF Prevention
- [ ] Forms include CSRF tokens (if applicable)
- [ ] API calls are authenticated

### Data Exposure
- [ ] No sensitive data in URLs
- [ ] No sensitive data in console logs
- [ ] API responses don't expose unnecessary data

---

## Documentation

- [ ] Role-based access documentation is complete
- [ ] Permission constants are documented
- [ ] API documentation includes permission requirements
- [ ] Code comments explain permission checks

---

## Regression Testing

After any changes:
- [ ] Re-run critical path tests
- [ ] Verify no permission regressions
- [ ] Verify data filtering still works
- [ ] Verify UI updates correctly

---

## Test Accounts

### Employee Test Account
- Email: `employee@inheritx.com`
- Password: `emp123`
- Role: `employee`

### HR Test Account
- Email: `hr@inheritx.com`
- Password: `hr123`
- Role: `hr`

---

## Sign-off

- [ ] All Employee role tests passed
- [ ] All HR role tests passed
- [ ] All security tests passed
- [ ] All edge cases tested
- [ ] Documentation reviewed
- [ ] Ready for production

**Tester Name**: _________________  
**Date**: _________________  
**Status**: ☐ Passed  ☐ Failed  ☐ Needs Review

---

**Last Updated**: November 2025

