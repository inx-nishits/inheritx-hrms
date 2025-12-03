"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionCheckboxGroup } from '@/components/roles/PermissionCheckboxGroup';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import Link from 'next/link';

export default function CreateRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    organizationId: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get organization ID from user profile or context
    // For now, we'll use a placeholder or fetch from profile
    if (user) {
      // You might need to fetch the user profile to get organizationId
      // For now, we'll leave it empty and let the API handle it
      setFormData(prev => ({ ...prev, organizationId: '' }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionKey];
      } else {
        return prev.filter(key => key !== permissionKey);
      }
    });
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    }
    
    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const roleData = {
        organizationId: formData.organizationId || undefined, // Let API handle if empty
        roleName: formData.roleName.trim(),
        description: formData.description.trim(),
        permissionIds: selectedPermissions,
      };

      await api.createRole(roleData);
      success('Role created successfully');
      
      // Navigate to roles list after a short delay
      setTimeout(() => {
        router.push('/hr/roles');
      }, 1000);
    } catch (err) {
      console.error('Failed to create role:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 pb-10">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/hr/roles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create New Role</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define a new role with specific permissions
            </p>
          </div>
        </div>

        {error && (
          <ErrorState
            title="Error Creating Role"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Basic Information
              </h2>
              <Card>
                <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Organization ID
                  </label>
                  <Input
                    value={formData.organizationId}
                    onChange={(e) => handleInputChange('organizationId', e.target.value)}
                    placeholder="Auto-filled from your organization"
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This field is automatically set based on your organization
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.roleName}
                    onChange={(e) => handleInputChange('roleName', e.target.value)}
                    placeholder="e.g., HR Manager, Admin, etc."
                    error={errors.roleName}
                    required
                  />
                  {errors.roleName && (
                    <p className="text-sm text-red-500 mt-1">{errors.roleName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role and its responsibilities..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Permissions</h2>
              <Card>
                <CardContent>
                  <PermissionCheckboxGroup
                    selectedPermissions={selectedPermissions}
                    onPermissionChange={handlePermissionChange}
                    error={errors.permissions}
                  />
                  {errors.permissions && (
                    <p className="text-sm text-red-500 mt-2">{errors.permissions}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Link href="/hr/roles">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading} loadingText="Creating...">
                <Save className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}

