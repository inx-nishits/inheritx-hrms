"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, Shield } from 'lucide-react';
import Link from 'next/link';

interface Permission {
  id: string;
  code: string;
  description: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
}

interface Role {
  id: string;
  roleName: string;
  description: string;
  createdAt?: string;
  permissions: RolePermission[];
  users?: any[];
}

export default function ViewRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params?.id as string;
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleId) {
      fetchRole();
    }
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getRole(roleId);
      const roleData = response.data || response;
      setRole(roleData);
    } catch (err) {
      console.error('Failed to fetch role:', err);
      setError(err instanceof Error ? err.message : 'Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !role) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="space-y-6 pb-10">
          <div className="flex items-center gap-4">
            <Link href="/hr/roles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <ErrorState
            title="Failed to Load Role"
            message={error || 'Role not found'}
            onRetry={fetchRole}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hr/roles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{role.roleName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                View role details and permissions
              </p>
            </div>
          </div>
          <Link href={`/hr/roles/edit/${role.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
          </Link>
        </div>

        {/* Role Information */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Role Information
          </h2>
          <Card>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Role Name
                </label>
                <div className="p-3 rounded-md bg-muted/50 border border-border">
                  {role.roleName}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Description
                </label>
                <div className="p-3 rounded-md bg-muted/50 border border-border min-h-[80px]">
                  {role.description || 'No description provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Total Permissions
                </label>
                <div className="p-3">
                  <Badge variant="secondary">
                    {role.permissions?.length || 0} permissions
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Permissions</h2>
          <Card>
            <CardContent>
              {role.permissions && role.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {role.permissions.map((rolePermission) => (
                    <div key={rolePermission.permissionId} className="flex flex-col p-4 rounded-md bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                          {rolePermission.permission.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No permissions assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

