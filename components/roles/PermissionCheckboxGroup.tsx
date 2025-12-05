"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';

export interface Permission {
  key: string;
  label: string;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

interface PermissionCheckboxGroupProps {
  selectedPermissions: string[];
  onPermissionChange: (permissionKey: string, checked: boolean) => void;
  error?: string;
}

export function PermissionCheckboxGroup({
  selectedPermissions,
  onPermissionChange,
  error,
}: PermissionCheckboxGroupProps) {
  const [permissionModules, setPermissionModules] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await api.getAllPermissions();
        const permissions = response.data || response;

        // Group permissions by module
        const groupedPermissions = permissions.reduce((acc: { [key: string]: Permission[] }, permission: any) => {
          const module = permission.code.split('.')[0];
          const action = permission.code.split('.')[1];

          if (!acc[module]) {
            acc[module] = [];
          }

          acc[module].push({
            key: permission.id, // Use permission ID as key instead of code
            label: action.charAt(0).toUpperCase() + action.slice(1),
          });

          return acc;
        }, {});

        // Convert to PermissionGroup format
        const modules: PermissionGroup[] = Object.keys(groupedPermissions).map(module => ({
          module: module.charAt(0).toUpperCase() + module.slice(1),
          permissions: groupedPermissions[module],
        }));

        setPermissionModules(modules);
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
        setFetchError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleModuleToggle = (module: PermissionGroup, checked: boolean) => {
    module.permissions.forEach(permission => {
      if (checked) {
        if (!selectedPermissions.includes(permission.key)) {
          onPermissionChange(permission.key, true);
        }
      } else {
        if (selectedPermissions.includes(permission.key)) {
          onPermissionChange(permission.key, false);
        }
      }
    });
  };

  const isModuleFullySelected = (module: PermissionGroup) => {
    return module.permissions.every(p => selectedPermissions.includes(p.key));
  };

  const isModulePartiallySelected = (module: PermissionGroup) => {
    const selectedCount = module.permissions.filter(p => selectedPermissions.includes(p.key)).length;
    return selectedCount > 0 && selectedCount < module.permissions.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Set Permissions</h3>
        <p className="text-sm text-muted-foreground">
          {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissionModules.map((module) => {
          const isFullySelected = isModuleFullySelected(module);
          const isPartiallySelected = isModulePartiallySelected(module);

          return (
            <Card key={module.module} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{module.module}</CardTitle>
                  <button
                    type="button"
                    onClick={() => handleModuleToggle(module, !isFullySelected)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      isFullySelected || isPartiallySelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {isFullySelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {module.permissions.map((permission) => {
                    const isChecked = selectedPermissions.includes(permission.key);
                    return (
                      <label
                        key={permission.key}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all',
                          isChecked
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted/50 border-border hover:bg-accent/50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => onPermissionChange(permission.key, e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                            isChecked
                              ? 'bg-primary border-primary'
                              : 'border-border bg-background'
                          )}
                        >
                          {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm font-medium">{permission.label}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
