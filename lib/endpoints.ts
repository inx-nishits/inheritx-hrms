import { employees } from "./mockData";

export const apiEndPoints = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    changePassword: "/change-password",
  },
  profile: {
    getProfile: (id: string | number) => `/users/${id}`,
    updateProfile: (id: string | number) => `/users/${id}`,
  },
  employees: {
    getProfile: (id: string | number) => `/employees/${id}`,
  },
  dashboard: "/dashboard/stats",
  user: {
    getUserList: "/user-management/users",
    downloadExcel: "/user-management/users/export",
    updateStatus: (userId: string | number) => {
      return `/user-management/users/${userId}/status`;
    },
  },
  post: {
    getPostList: "/post-management/posts/flagged",
    deletePost: "/post-management/posts",
    resolvedPost: "/post-management/posts",
  },
  contactusQueries: {
    getQueries: "/contact-us/queries",
    updateQueryStatus: (queryId: string | number) => {
      return `/contact-us/queries/${queryId}/status`;
    },
  },
  content: {
    getContentData: (contentType: string | number) => {
      return `/content-management/${contentType}`;
    },
    addContentData: "/content-management",
  },
  setting: {
    getSettingList: "/settings/app-updates",
    addNewVersion: "/settings/app-updates",
  },
};
