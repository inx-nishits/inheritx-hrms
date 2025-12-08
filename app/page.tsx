"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnDashboard from '@/components/dashboards/OnDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import HRDashboard from '@/components/dashboards/HRDashboard';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Route to appropriate dashboard based on role
  if (user.role.includes('HR Manager')) {
    return <HRDashboard />;
  }

  return <EmployeeDashboard />;
}
