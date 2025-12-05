import { apiEndPoints } from './endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to make authenticated requests
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired or invalid, logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }

  return response.json();
};

export const api = {
  // Auth APIs
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${apiEndPoints.auth.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Login failed');
      }

      const data = await response.json();
      // Store access token and expiry
      console.log("data",data, data.data.accessToken)

      if (data.data && data.data.accessToken) {
      console.log("data",data, data.accessToken)

        localStorage.setItem('accessToken', data.data.accessToken);
        // Assuming expiry is in seconds, convert to timestamp
        if (data.expires_in) {
          const expiryTime = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }
      }
      console.log("access token", localStorage.getItem('accessToken'))
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('API call failed:', error);
      throw new Error('Network error or server unavailable');
    }
  },

  forgotPassword: async (email: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.auth.forgotPassword}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.auth.resetPassword}`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.auth.changePassword}`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Profile APIs
  getProfile: async (id: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.profile.getProfile(id)}`);
  },
  
  getEmployeeProfile: async (id: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.employees.getProfile(id)}`);
  },

  updateProfile: async (profileData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.profile.updateProfile}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Dashboard APIs
  getDashboardStats: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.dashboard}`);
  },

  // User Management APIs
  getUserList: async (params?: any) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `${API_BASE_URL}${apiEndPoints.user.getUserList}?${queryString}` : `${API_BASE_URL}${apiEndPoints.user.getUserList}`;
    return authenticatedFetch(url);
  },

  downloadUserExcel: async () => {
    // For file downloads, we need to handle differently
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${apiEndPoints.user.downloadExcel}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
      throw new ApiError(401, 'Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new ApiError(response.status, 'Download failed');
    }

    return response.blob();
  },

  updateUserStatus: async (userId: string | number, status: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.user.updateStatus(userId)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Post Management APIs
  getPostList: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.post.getPostList}`);
  },

  deletePost: async (postId: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.post.deletePost}/${postId}`, {
      method: 'DELETE',
    });
  },

  resolvePost: async (postId: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.post.resolvedPost}/${postId}/resolve`, {
      method: 'PUT',
    });
  },

  // Contact Us Queries APIs
  getQueries: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.contactusQueries.getQueries}`);
  },

  updateQueryStatus: async (queryId: string | number, status: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.contactusQueries.updateQueryStatus(queryId)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Content Management APIs
  getContentData: async (contentType: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.content.getContentData(contentType)}`);
  },

  addContentData: async (contentData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.content.addContentData}`, {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },

  // Settings APIs
  getSettingList: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.setting.getSettingList}`);
  },

  addNewVersion: async (versionData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.setting.addNewVersion}`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
  },

  // Role Management APIs
  getRoles: async (params?: any) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `${API_BASE_URL}${apiEndPoints.roles.getRoles}?${queryString}` : `${API_BASE_URL}${apiEndPoints.roles.getRoles}`;
    return authenticatedFetch(url);
  },

  getRole: async (roleId: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.roles.getRole(roleId)}`);
  },

  createRole: async (roleData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.roles.createRole}`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  updateRole: async (roleId: string | number, roleData: any) => {
    console.log("roleData", roleData, "roleId", roleId)
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.roles.updateRole(roleId)}`, {
      method: 'PATCH',
      body: JSON.stringify(roleData),
    });
  },

  deleteRole: async (roleId: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.roles.deleteRole(roleId)}`, {
      method: 'DELETE',
    });
  },

  updateRoleStatus: async (roleId: string | number, status: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.roles.updateRoleStatus(roleId)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Permissions APIs
  getAllPermissions: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.permissions.allPermissions}`);
  },
};
