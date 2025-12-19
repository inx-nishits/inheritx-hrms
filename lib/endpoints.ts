import { employees } from "./mockData";

export const apiEndPoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  permissions: {
    allPermissions: "/permissions/all",
    permissionsList: "/permissions",
  },
  profile: {
    getProfile: (id: string | number) => `/users/${id}`,
    updateProfile: (id: string | number) => `/users/${id}`,
  },
  employees: {
    list: "/employees",
    getProfile: (id: string | number) => `/employees/${id}`,
    createEmployee: "/employees",
  },
  dashboard: "/dashboard/stats",
  user: {
    getUserList: "/user-management/users",
    downloadExcel: "/user-management/users/export",
    updateStatus: (userId: string | number) => {
      return `/user-management/users/${userId}/status`;
    },
  },
  roles: {
    getRoles: "/roles",
    getRole: (roleId: string | number) => `/roles/${roleId}`,
    createRole: "/roles",
    updateRole: (roleId: string | number) => `/roles/${roleId}`,
    deleteRole: (roleId: string | number) => `/roles/${roleId}`,
    updateRoleStatus: (roleId: string | number) => `/roles/${roleId}/status`,
  },
  contactusQueries: {
    getQueries: "/contact-us/queries",
    updateQueryStatus: (queryId: string | number) => `/contact-us/queries/${queryId}/status`,
  },
  departments: {
    getDepartments: "/departments",
  },
  designations: {
    getDesignations: "/designations",
  },
  attendance: {
    checkIn: "/attendance/check-in",
    checkOut: "/attendance/check-out",
    getAttendance: (id: string | number) => `/attendance/status/${id}`,
    getEmployeeAttendance: (id: string | number) => `/attendance/employee/${id}`,
  },
  // Leave Management APIs
  leave: {
    // Get all leave types with details for organization
    getLeaveTypes: "/leave/types",
    // Create a new leave request
    createLeave: "/leave",
    // List all leave requests (for HR/Admin)
    listAllLeaves: "/leave",
    // Get all pending leave requests (for HR/Admin)
    getPendingLeaves: "/leave/pending",
    // Approve/Reject a leave request
    updateLeaveStatus: (leaveId: string | number) => `/leave/${leaveId}/approve`,
    // Get employee leave balance for a specific leave type
    getLeaveBalance: (employeeId: string | number, leaveTypeId: string | number) =>
      `/leave/balance/${employeeId}/${leaveTypeId}`,
    // Get employee leave requests (paginated)
    getEmployeeLeaves: (employeeId: string | number) =>
      `/leave/employee/${employeeId}`,
    // Get a single leave request by ID
    getLeaveDetails: (leaveId: string | number) => `/leave/${leaveId}`,
  },
};
