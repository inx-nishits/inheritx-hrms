"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { 
  Shield, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Role {
  id: string;
  organizationId: string;
  roleName: string;
  description: string;
  status: 'active' | 'inactive';
  permissionIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; role: Role | null }>({
    isOpen: false,
    role: null,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getRoles();
      
      // Handle different API response structures
      let rolesData: Role[] = [];
      
      if (Array.isArray(response)) {
        rolesData = response;
      } else if (response && typeof response === 'object') {
        // Handle response.data, response.roles, or response.items
        if (Array.isArray(response.data)) {
          rolesData = response.data;
        } else if (Array.isArray(response.roles)) {
          rolesData = response.roles;
        } else if (Array.isArray(response.items)) {
          rolesData = response.items;
        } else if (response.data && Array.isArray(response.data.data)) {
          rolesData = response.data.data;
        }
      }
      
      // Ensure rolesData is always an array
      if (!Array.isArray(rolesData)) {
        console.warn('API response is not an array, defaulting to empty array:', response);
        rolesData = [];
      }
      
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
      showError('Failed to load roles. Please try again.');
      // Ensure roles is always an array even on error
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.role) return;

    try {
      await api.deleteRole(deleteModal.role.id);
      success('Role deleted successfully');
      setDeleteModal({ isOpen: false, role: null });
      fetchRoles();
    } catch (err) {
      console.error('Failed to delete role:', err);
      showError('Failed to delete role. Please try again.');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      const newStatus = role.status === 'active' ? 'inactive' : 'active';
      await api.updateRoleStatus(role.id, newStatus);
      success(`Role ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchRoles();
    } catch (err) {
      console.error('Failed to update role status:', err);
      showError('Failed to update role status. Please try again.');
    }
  };

  const filteredRoles = Array.isArray(roles) ? roles.filter(role =>
    role?.roleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 pb-10">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Roles Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage roles and their permissions
            </p>
          </div>
          <Link href="/hr/roles/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </Link>
        </div>

        {error && !roles.length ? (
          <ErrorState
            title="Failed to Load Roles"
            message={error}
            onRetry={fetchRoles}
          />
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white"
              />
            </div>

            {/* Roles Table */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">All Roles ({filteredRoles.length})</h2>
              <Card>
                <CardContent>
                {paginatedRoles.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No roles found matching your search.' : 'No roles found. Create your first role to get started.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Role Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Total Permissions</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRoles.map((role) => (
                            <tr key={role.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-foreground">{role.roleName}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                                  {role.description || 'No description'}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary">
                                  {role.permissionIds?.length || 0} permissions
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge 
                                  variant={role.status === 'active' ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => handleToggleStatus(role)}
                                >
                                  {role.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Link href={`/hr/roles/${role.id}`}>
                                    <Button variant="ghost" size="sm" title="View">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/hr/roles/edit/${role.id}`}>
                                    <Button variant="ghost" size="sm" title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteModal({ isOpen: true, role })}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRoles.length)} of {filteredRoles.length} roles
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, role: null })}
          title="Delete Role"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete the role <strong>{deleteModal.role?.roleName}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, role: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

