"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type UserRole = "employee" | "hr" | "HR Manager" | "System Admin";

export interface User {
  id: string;
  name: string;
  employeeId:string;
  email: string;
  role: UserRole[]; // mapped roles
  department?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, requiredRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean; // checks ALL roles provided
  hasAnyRole: (roles: UserRole[]) => boolean; // checks ANY role provided
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * canonical role mapping: handle backend variants and map them to the exact
 * union strings we use in the frontend.
 */
const canonicalMap: Record<string, UserRole> = {
  "hr manager": "HR Manager",
  "hrmanager": "HR Manager",
  "system admin": "System Admin",
  "systemadmin": "System Admin",
  "system_admin": "System Admin",
  "hr": "hr",
  "human resources": "hr",
  "employee": "employee",
  "emp": "employee",
  "user": "employee", // optional mapping if backend returns generic 'user'
};

/** normalize string for mapping */
const normalize = (s?: string) => (s ?? "").toString().trim().toLowerCase();

/** try to map any incoming string to our UserRole, otherwise undefined */
const mapToUserRole = (raw?: string): UserRole | undefined => {
  const key = normalize(raw);
  if (!key) return undefined;
  return canonicalMap[key] ?? undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeJWT = (token: string) => {
    try {
      const payload = token.split('.')[1];
      // JWT uses base64url, convert to base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded;
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const checkTokenExpiry = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.exp) {
        const expiryTime = decoded.exp * 1000;
        if (Date.now() > expiryTime) {
          console.warn("Token expired — logging out.");
          logout();
          return;
        }
      }
    }
    // Fallback to stored expiry if available
    const expiry = localStorage.getItem("tokenExpiry");
    if (expiry) {
      const expiryNum = Number(expiry);
      if (!Number.isNaN(expiryNum) && Date.now() > expiryNum) {
        console.warn("Token expired — logging out.");
        logout();
      }
    }
  };

  useEffect(() => {
    // Rehydrate user from localStorage
    const savedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    if (savedUser && accessToken) {
      try {
        const parsed: User = JSON.parse(savedUser);
        // Basic validation: ensure parsed.role is array
        if (parsed && Array.isArray(parsed.role)) {
          // Check if token is expired before setting user
          const decoded = decodeJWT(accessToken);
          if (decoded && decoded.exp) {
            const expiryTime = decoded.exp * 1000;
            if (Date.now() > expiryTime) {
              console.warn("Token expired on app load — not restoring user.");
              localStorage.removeItem("user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("tokenExpiry");
            } else {
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
        } else {
          localStorage.removeItem("user");
        }
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    // Immediately check expiry and then every minute
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60_000);

    setIsLoading(false);

    return () => clearInterval(interval);
  }, []);

  /**
   * login: call api.login, normalize/map api roles, optionally check requiredRole,
   * store user + tokens and token expiry if provided (expiresIn seconds).
   */
  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const responseData = await api.login(email, password);
    const body = responseData.data ?? responseData;

    const apiUser = body.data?.user ?? body.user;
    if (!apiUser) return false;

    // Backend roles (array of strings)
    const rolesFromApi: string[] = apiUser.role ?? [];
      console.log("rolesFromApi", rolesFromApi)
    // Normalize + map to your UserRole union
    const normalize = (s?: string) => (s ?? "").trim().toLowerCase();

    const roleMap: Record<string, UserRole> = {
      "employee": "employee",
      "emp": "employee",
      "hr": "hr",
      "human resources": "hr",
      "hr manager": "HR Manager",
      "system admin": "System Admin"
    };

    const mappedRoles: UserRole[] = rolesFromApi
      .map(r => roleMap[normalize(r)])
      .filter((r): r is UserRole => !!r);

    console.log("Mapped Roles:", mappedRoles);

    // ❗ Main Logic: If backend roles do NOT match ANY UserRole → FAIL login
    if (mappedRoles.length === 0) {
      console.log("No matching roles found → Login failed");
      return false;
    }

    // Build final user object
    const userData: User = {
      id: apiUser.id,
      employeeId:apiUser.employeeId,
      email: apiUser.email,
      name: apiUser.name ?? apiUser.email,
      role: mappedRoles,
      department: apiUser.department,
      avatar: apiUser.avatar
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // Save tokens
    const accessToken = body.data?.accessToken ?? body.accessToken;
    const refreshToken = body.data?.refreshToken ?? body.refreshToken;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      // Set token expiry from JWT
      const decoded = decodeJWT(accessToken);
      if (decoded && decoded.exp) {
        const expiryTime = decoded.exp * 1000;
        localStorage.setItem("tokenExpiry", expiryTime.toString());
      }
    }
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    // redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  /**
   * hasRole: checks that user has ALL roles provided in `roles` argument.
   * Example:
   *   hasRole("hr") -> true if user has hr
   *   hasRole(["hr", "System Admin"]) -> true only if user has both roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    // ensure every requested role exists on user.role
    return roleArray.every((r) => user.role.includes(r));
  };

  /** hasAnyRole: returns true if user has ANY one of the roles in the array */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.some((r) => user.role.includes(r));
  };

  // Expose the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !isLoading && !!user,
        isLoading,
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

