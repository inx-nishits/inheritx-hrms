"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'employee' | 'hr';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'employee@inheritx.com': {
    user: {
      id: '1',
      name: 'Mike Chen',
      email: 'employee@inheritx.com',
      role: 'employee',
      department: 'Engineering',
    },
    password: 'emp123',
  },
  'hr@inheritx.com': {
    user: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'hr@inheritx.com',
      role: 'hr',
      department: 'Human Resources',
    },
    password: 'hr123',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userData = MOCK_USERS[email.toLowerCase()];
    
    if (!userData) {
      return false;
    }

    // If role is specified, verify it matches
    if (role && userData.user.role !== role) {
      return false;
    }

    // Check password
    if (userData.password !== password) {
      return false;
    }

    setUser(userData.user);
    localStorage.setItem('user', JSON.stringify(userData.user));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles);
  };

  // Always render the provider, even during mounting
  // This prevents "useAuth must be used within an AuthProvider" errors
  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        isAuthenticated: mounted ? !!user : false,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

