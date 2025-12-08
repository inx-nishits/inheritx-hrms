import { employees } from "./mockData";

export const apiEndPoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    changePassword: "/change-password",
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
  content: {
    getContentData: (contentType: string | number) => {
      return `/content-management/${contentType}`;
    },
    addContentData: "/content-management",
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
  post: {
    getPostList: "/posts",
    deletePost: "/posts",
    resolvedPost: "/posts",
  },
  setting: {
    getSettingList: "/settings",
    addNewVersion: "/settings/versions",
  },
  departments: {
    getDepartments: "/departments",
  },
  designations: {
    getDesignations: "/designations",
  },
};
