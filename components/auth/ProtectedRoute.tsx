"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { UserRole } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
  requireAuth = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for loading to complete

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // Check role-based access
      if (allowedRoles && !hasAnyRole(allowedRoles)) {
        router.push('/');
        return;
      }

      // Check permission-based access
      if (requiredPermission && !user?.role.some(role => hasPermission(role, requiredPermission))) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, requiredPermission, requireAuth, hasAnyRole, router]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Loading fullScreen text="Redirecting to login..." />;
  }

  if (isAuthenticated) {
    // Check role access
    if (allowedRoles && !hasAnyRole(allowedRoles)) {
      return <Loading fullScreen text="Access denied. Redirecting..." />;
    }

    // Check permission access
    if (requiredPermission && !user?.role.some(role => hasPermission(role, requiredPermission))) {
      return <Loading fullScreen text="Insufficient permissions. Redirecting..." />;
    }
  }

  return <>{children}</>;
}
