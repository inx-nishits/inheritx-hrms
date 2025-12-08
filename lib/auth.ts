import { UserRole, User } from '@/contexts/AuthContext';
import { api } from './api';

/**
 * Role-based access control utilities
 * Comprehensive permission system for HRMS
 */

// Permission constants for type safety (fallback/default permissions)
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Attendance
  VIEW_OWN_ATTENDANCE: 'view_own_attendance',
  VIEW_ALL_ATTENDANCE: 'view_all_attendance',
  MANAGE_ATTENDANCE: 'manage_attendance',
  REGULARIZE_ATTENDANCE: 'regularize_attendance',
  REQUEST_WFH: 'request_wfh',
  REQUEST_PARTIAL_DAY: 'request_partial_day',

  // Leave
  VIEW_OWN_LEAVES: 'view_own_leaves',
  VIEW_ALL_LEAVES: 'view_all_leaves',
  REQUEST_LEAVES: 'request_leaves',
  APPROVE_LEAVES: 'approve_leaves',
  REJECT_LEAVES: 'reject_leaves',
  MANAGE_LEAVE_POLICIES: 'manage_leave_policies',

  // Payroll
  VIEW_OWN_PAYROLL: 'view_own_payroll',
  VIEW_ALL_PAYROLL: 'view_all_payroll',
  MANAGE_PAYROLL: 'manage_payroll',
  PROCESS_PAYROLL: 'process_payroll',

  // Employees
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_ALL_EMPLOYEES: 'view_all_employees',
  MANAGE_EMPLOYEES: 'manage_employees',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',

  // Organization
  VIEW_ORGANIZATION: 'view_organization',
  MANAGE_ORGANIZATION: 'manage_organization',
  MANAGE_DEPARTMENTS: 'manage_departments',

  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_POLICIES: 'manage_policies',

  // Onboarding
  MANAGE_ONBOARDING: 'manage_onboarding',

  // Inbox
  VIEW_INBOX: 'view_inbox',
  MANAGE_INBOX: 'manage_inbox',
} as const;

// Dynamic permissions cache
let dynamicPermissions: Record<string, string[]> | null = null;
let permissionsLoaded = false;

/**
 * Load permissions from API and cache them
 */
export async function loadPermissions(): Promise<void> {
  if (permissionsLoaded) return;

  try {
    const response = await api.getAllPermissions();
    if (response?.data) {
      // Assuming the API returns { role: permissions[] } format
      dynamicPermissions = response.data;
      permissionsLoaded = true;
    }
  } catch (error) {
    console.warn('Failed to load dynamic permissions, using fallback:', error);
    // Fallback to static permissions if API fails
    dynamicPermissions = {
      employee: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_OWN_ATTENDANCE,
        PERMISSIONS.REGULARIZE_ATTENDANCE,
        PERMISSIONS.REQUEST_WFH,
        PERMISSIONS.REQUEST_PARTIAL_DAY,
        PERMISSIONS.VIEW_OWN_LEAVES,
        PERMISSIONS.REQUEST_LEAVES,
        PERMISSIONS.VIEW_OWN_PAYROLL,
        PERMISSIONS.VIEW_OWN_PROFILE,
        PERMISSIONS.EDIT_OWN_PROFILE,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.VIEW_INBOX,
      ],
      hr: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ALL_ATTENDANCE,
        PERMISSIONS.MANAGE_ATTENDANCE,
        PERMISSIONS.REGULARIZE_ATTENDANCE,
        PERMISSIONS.VIEW_ALL_LEAVES,
        PERMISSIONS.APPROVE_LEAVES,
        PERMISSIONS.REJECT_LEAVES,
        PERMISSIONS.MANAGE_LEAVE_POLICIES,
        PERMISSIONS.VIEW_ALL_PAYROLL,
        PERMISSIONS.MANAGE_PAYROLL,
        PERMISSIONS.PROCESS_PAYROLL,
        PERMISSIONS.VIEW_ALL_EMPLOYEES,
        PERMISSIONS.MANAGE_EMPLOYEES,
        PERMISSIONS.ADD_EMPLOYEE,
        PERMISSIONS.EDIT_EMPLOYEE,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.MANAGE_ORGANIZATION,
        PERMISSIONS.MANAGE_DEPARTMENTS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.MANAGE_POLICIES,
        PERMISSIONS.MANAGE_ONBOARDING,
        PERMISSIONS.VIEW_INBOX,
        PERMISSIONS.MANAGE_INBOX,
      ],
      "HR Manager": [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ALL_ATTENDANCE,
        PERMISSIONS.MANAGE_ATTENDANCE,
        PERMISSIONS.REGULARIZE_ATTENDANCE,
        PERMISSIONS.VIEW_ALL_LEAVES,
        PERMISSIONS.APPROVE_LEAVES,
        PERMISSIONS.REJECT_LEAVES,
        PERMISSIONS.MANAGE_LEAVE_POLICIES,
        PERMISSIONS.VIEW_ALL_PAYROLL,
        PERMISSIONS.MANAGE_PAYROLL,
        PERMISSIONS.PROCESS_PAYROLL,
        PERMISSIONS.VIEW_ALL_EMPLOYEES,
        PERMISSIONS.MANAGE_EMPLOYEES,
        PERMISSIONS.ADD_EMPLOYEE,
        PERMISSIONS.EDIT_EMPLOYEE,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.MANAGE_ORGANIZATION,
        PERMISSIONS.MANAGE_DEPARTMENTS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.MANAGE_POLICIES,
        PERMISSIONS.MANAGE_ONBOARDING,
        PERMISSIONS.VIEW_INBOX,
        PERMISSIONS.MANAGE_INBOX,
      ],
      "System Admin": [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ALL_ATTENDANCE,
        PERMISSIONS.MANAGE_ATTENDANCE,
        PERMISSIONS.REGULARIZE_ATTENDANCE,
        PERMISSIONS.REQUEST_WFH,
        PERMISSIONS.REQUEST_PARTIAL_DAY,
        PERMISSIONS.VIEW_ALL_LEAVES,
        PERMISSIONS.APPROVE_LEAVES,
        PERMISSIONS.REJECT_LEAVES,
        PERMISSIONS.MANAGE_LEAVE_POLICIES,
        PERMISSIONS.VIEW_ALL_PAYROLL,
        PERMISSIONS.MANAGE_PAYROLL,
        PERMISSIONS.PROCESS_PAYROLL,
        PERMISSIONS.VIEW_OWN_PAYROLL,
        PERMISSIONS.VIEW_ALL_EMPLOYEES,
        PERMISSIONS.MANAGE_EMPLOYEES,
        PERMISSIONS.ADD_EMPLOYEE,
        PERMISSIONS.EDIT_EMPLOYEE,
        PERMISSIONS.VIEW_OWN_PROFILE,
        PERMISSIONS.EDIT_OWN_PROFILE,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.MANAGE_ORGANIZATION,
        PERMISSIONS.MANAGE_DEPARTMENTS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.MANAGE_POLICIES,
        PERMISSIONS.MANAGE_ONBOARDING,
        PERMISSIONS.VIEW_INBOX,
        PERMISSIONS.MANAGE_INBOX,
      ],
    };
    permissionsLoaded = true;
  }
}

/**
 * Get permissions for a role, using dynamic permissions if available
 */
function getRolePermissions(role: UserRole): string[] {
  if (dynamicPermissions && dynamicPermissions[role]) {
    return dynamicPermissions[role];
  }

  // Fallback to static permissions if dynamic ones aren't loaded
  return dynamicPermissions?.[role] || [];
}

export function hasPermission(userRole: UserRole | UserRole[] | null, permission: string): boolean {
  if (!userRole) return false;
  const roles = Array.isArray(userRole) ? userRole : [userRole];

  // Ensure permissions are loaded
  if (!permissionsLoaded) {
    console.warn('Permissions not loaded yet, call loadPermissions() first');
    return false;
  }

  return roles.some(role => getRolePermissions(role).includes(permission));
}

export function canAccessRoute(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    employee: 'Employee',
    hr: 'HR',
    "HR Manager": 'HR Manager',
    "System Admin": 'System Admin',
  };
  return displayNames[role] || role;
}

/**
 * Data filtering utilities - ensures employees only see their own data
 */
export function canViewEmployeeData(
  currentUser: User | null,
  targetEmployeeId: string | null | undefined
): boolean {
  if (!currentUser) return false;

  // HR can view all employees
  if (currentUser.role.includes('hr') || currentUser.role.includes('HR Manager') || currentUser.role.includes('System Admin')) return true;

  // Employees can only view their own data
  if (currentUser.role.includes('employee')) {
    return currentUser.id === targetEmployeeId;
  }

  return false;
}

export function canEditEmployeeData(
  currentUser: User | null,
  targetEmployeeId: string | null | undefined
): boolean {
  if (!currentUser) return false;

  // HR can edit all employees
  if (currentUser.role.includes('hr') || currentUser.role.includes('HR Manager') || currentUser.role.includes('System Admin')) return true;

  // Employees can only edit their own profile (limited fields)
  if (currentUser.role.includes('employee')) {
    return currentUser.id === targetEmployeeId;
  }

  return false;
}

/**
 * Filter data based on user role
 */
export function filterDataByRole<T extends { employeeId?: string; id?: string }>(
  data: T[],
  currentUser: User | null
): T[] {
  if (!currentUser) return [];

  // HR sees all data
  if (currentUser.role.includes('hr') || currentUser.role.includes('HR Manager') || currentUser.role.includes('System Admin')) return data;

  // Employees see only their own data
  if (currentUser.role.includes('employee')) {
    return data.filter(item =>
      item.employeeId === currentUser.id || item.id === currentUser.id
    );
  }

  return [];
}

/**
 * API route protection helper (for future API routes)
 */
export function validateApiAccess(
  user: User | null,
  requiredPermission: string,
  resourceOwnerId?: string
): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Check permission
  if (!hasPermission(user.role, requiredPermission)) {
    return { allowed: false, reason: 'Insufficient permissions' };
  }

  // For employee role, check resource ownership
  if (user.role.includes('employee') && resourceOwnerId && user.id !== resourceOwnerId) {
    return { allowed: false, reason: 'Access denied: Cannot access other employees\' data' };
  }

  return { allowed: true };
}
