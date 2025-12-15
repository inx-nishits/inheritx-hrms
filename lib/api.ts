import { apiEndPoints } from './endpoints';
import { employees } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || false;

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

// Mock JWT token generator for development
const generateMockToken = (payload: any): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
  const tokenPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  const body = btoa(JSON.stringify(tokenPayload));
  return `${header}.${body}.mock_signature`;
};

// Mock login function using employees from mockData
const mockLogin = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find employee by email (any password works in mock mode)
  const employee = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
  
  if (!employee) {
    throw new ApiError(401, 'Invalid email or password');
  }
  
  // Determine role based on designation
  let roles: string[] = ['employee'];
  if (employee.designation.toLowerCase().includes('hr manager')) {
    roles = ['HR Manager'];
  } else if (employee.department.toLowerCase().includes('human resources')) {
    roles = ['hr'];
  } else if (employee.designation.toLowerCase().includes('admin')) {
    roles = ['System Admin'];
  }
  
  // Generate mock token
  const accessToken = generateMockToken({
    id: employee.id,
    email: employee.email,
    name: employee.name,
    role: roles,
    employeeId: employee.id,
    department: employee.department,
  });
  
  return {
    data: {
      user: {
        id: employee.id,
        employeeId: employee.id,
        email: employee.email,
        name: employee.name,
        role: roles,
        department: employee.department,
        avatar: employee.avatar,
      },
      accessToken,
      refreshToken: `mock_refresh_${accessToken}`,
    },
    expires_in: 86400, // 24 hours
  };
};

export const api = {
  // Auth APIs
  login: async (email: string, password: string) => {
    // Use mock API if enabled or if real API fails
    if (USE_MOCK_API) {
      console.log('Using mock API for login');
      const mockData = await mockLogin(email, password);
      // Store token for consistency with real API flow
      if (mockData.data && mockData.data.accessToken) {
        localStorage.setItem('accessToken', mockData.data.accessToken);
        if (mockData.expires_in) {
          const expiryTime = Date.now() + (mockData.expires_in * 1000);
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }
      }
      return mockData;
    }
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for faster fallback

      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}${apiEndPoints.auth.login}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle abort (timeout)
        if (fetchError.name === 'AbortError') {
          console.warn('API request timed out, falling back to mock API');
          const mockData = await mockLogin(email, password);
          if (mockData.data && mockData.data.accessToken) {
            localStorage.setItem('accessToken', mockData.data.accessToken);
            if (mockData.expires_in) {
              const expiryTime = Date.now() + (mockData.expires_in * 1000);
              localStorage.setItem('tokenExpiry', expiryTime.toString());
            }
          }
          return mockData;
        }
        
        // Handle network errors - fallback to mock
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          console.warn('Network error detected, falling back to mock API');
          const mockData = await mockLogin(email, password);
          if (mockData.data && mockData.data.accessToken) {
            localStorage.setItem('accessToken', mockData.data.accessToken);
            if (mockData.expires_in) {
              const expiryTime = Date.now() + (mockData.expires_in * 1000);
              localStorage.setItem('tokenExpiry', expiryTime.toString());
            }
          }
          return mockData;
        }
        
        // Re-throw other errors
        throw fetchError;
      }
      
      clearTimeout(timeoutId);

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
      if (error instanceof ApiError && error.status !== 0) {
        throw error;
      }
      console.error('API call failed, falling back to mock API:', error);
      
      // Fallback to mock API on any network/server error
      try {
        const mockData = await mockLogin(email, password);
        if (mockData.data && mockData.data.accessToken) {
          localStorage.setItem('accessToken', mockData.data.accessToken);
          if (mockData.expires_in) {
            const expiryTime = Date.now() + (mockData.expires_in * 1000);
            localStorage.setItem('tokenExpiry', expiryTime.toString());
          }
        }
        return mockData;
      } catch (mockError) {
        throw mockError;
      }
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

  changePassword: async (oldPassword: string, newPassword: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.auth.changePassword}`, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  // Profile APIs
  getProfile: async (id: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.profile.getProfile(id)}`);
  },
  
  getEmployeeProfile: async (id: string | number) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.employees.getProfile(id)}`);
  },

  updateProfile: async (userId: string | number, profileData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.profile.updateProfile(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Dashboard APIs
  getDashboardStats: async () => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.dashboard}`);
  },

  // Employee Management APIs
  getEmployees: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    departmentId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.department && params.department !== 'all') {
      searchParams.set('department', params.department);
    }
    if (params?.departmentId && params.departmentId !== 'all') {
      searchParams.set('departmentId', params.departmentId);
    }
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_BASE_URL}${apiEndPoints.employees.list}?${queryString}`
      : `${API_BASE_URL}${apiEndPoints.employees.list}`;

    return authenticatedFetch(url);
  },

  createEmployee: async (employeeData: any) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.employees.createEmployee}`, {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
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

  // Departments APIs
  getDepartments: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
    }).toString() : '';
    const url = queryString ? `${API_BASE_URL}${apiEndPoints.departments.getDepartments}?${queryString}` : `${API_BASE_URL}${apiEndPoints.departments.getDepartments}`;
    return authenticatedFetch(url);
  },

  // Designations APIs
  getDesignations: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 100),
    }).toString() : '';
    const url = queryString ? `${API_BASE_URL}${apiEndPoints.designations.getDesignations}?${queryString}` : `${API_BASE_URL}${apiEndPoints.designations.getDesignations}`;
    return authenticatedFetch(url);
  },

  // Attendance APIs
  checkIn: async (employeeId: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.attendance.checkIn}`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  },

  checkOut: async (employeeId: string) => {
    return authenticatedFetch(`${API_BASE_URL}${apiEndPoints.attendance.checkOut}`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  },

  getAttendance: async (employeeId: string | number, date?: string) => {
    const url = date
      ? `${API_BASE_URL}${apiEndPoints.attendance.getAttendance(employeeId)}?date=${date}`
      : `${API_BASE_URL}${apiEndPoints.attendance.getAttendance(employeeId)}`;
    return authenticatedFetch(url);
  },

  getEmployeeAttendance: async (
    employeeId: string | number,
    params?: { page?: number; limit?: number; filter?: string; tab?: 'logs' | 'requests' }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.filter) searchParams.set('filter', params.filter);
    if (params?.tab) searchParams.set('tab', params.tab);

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_BASE_URL}${apiEndPoints.attendance.getEmployeeAttendance(employeeId)}?${queryString}`
      : `${API_BASE_URL}${apiEndPoints.attendance.getEmployeeAttendance(employeeId)}`;

    return authenticatedFetch(url);
  },
};
