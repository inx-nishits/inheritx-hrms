"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function HREmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      {children}
    </ProtectedRoute>
  );
}
