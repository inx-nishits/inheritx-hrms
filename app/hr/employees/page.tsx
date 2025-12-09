"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { StoredEmployee } from '@/lib/storage';

type DepartmentOption = { id: string; name: string };

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<StoredEmployee[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([
    { id: 'all', name: 'All Departments' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce search to avoid hitting API on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Fetch departments once to populate filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.getDepartments({ page: 1, limit: 100 });
        let items: DepartmentOption[] = [];

        const normalize = (arr: any[]) =>
          arr
            .map((d, idx) => {
              const id = d.id || d._id || d.value || d.departmentId || d.department_id || idx;
              const name = d.name || d.departmentName || d.label || '';
              if (!name) return null;
              return { id: String(id), name: String(name) };
            })
            .filter(Boolean) as DepartmentOption[];

        if (response && typeof response === 'object') {
          if (Array.isArray(response?.data?.data)) {
            items = normalize(response.data.data);
          } else if (Array.isArray(response?.data)) {
            items = normalize(response.data);
          } else if (Array.isArray(response)) {
            items = normalize(response as any[]);
          }
        }

        const deduped = Array.from(
          new Map(items.map((d) => [d.id, d])).values()
        );

        setDepartments([{ id: 'all', name: 'All Departments' }, ...deduped]);
      } catch (err) {
        console.error('Failed to load departments filter', err);
        setDepartments([{ id: 'all', name: 'All Departments' }]);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getEmployees({
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
          // Backend expects departmentId for filtering
          departmentId: selectedDepartmentId !== 'all' ? selectedDepartmentId : undefined,
          sortBy,
          sortOrder,
        });

        const { items, total } = normalizeEmployeesResponse(response);
        setEmployees(items);
        setTotalEmployees(total);
      } catch (err: any) {
        console.error('Failed to fetch employees list', err);
        setError(err?.message || 'Failed to fetch employees. Please try again.');
        setEmployees([]);
        setTotalEmployees(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, debouncedSearch, selectedDepartmentId, sortBy, sortOrder, reloadKey]);

  const totalPages = Math.max(1, Math.ceil((totalEmployees || 0) / pageSize));

  const stats = useMemo(() => {
    const activeCount = employees.filter((e) => {
      const status = (e as any).status;
      if (!status || typeof status !== 'string') return false;
      return status.toLowerCase() === 'active';
    }).length;
    const deptCount = new Set(employees.map((e) => e.department).filter(Boolean)).size;
    const newThisMonth = employees.filter((e) => {
      if (!e.joinDate) return false;
      const join = new Date(e.joinDate);
      const now = new Date();
      return join.getMonth() === now.getMonth() && join.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: totalEmployees,
      active: activeCount,
      departments: deptCount,
      newThisMonth,
    };
  }, [employees, totalEmployees]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    setPage((prev) => {
      if (direction === 'prev') {
        return Math.max(1, prev - 1);
      }
      return Math.min(totalPages, prev + 1);
    });
  };

  const handleSortChange = (value: string) => {
    if (value === 'name-asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'name-desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (value === 'joinDate-asc') {
      setSortBy('joinDate');
      setSortOrder('asc');
    } else if (value === 'joinDate-desc') {
      setSortBy('joinDate');
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle 
          size="lg" 
          description="Manage and view all employees"
        >
          Employee Management
        </PageTitle>
        <Link href="/hr/employees/add">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200/50 dark:border-green-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-500/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200/50 dark:border-purple-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Departments</p>
                <p className="text-2xl font-bold text-foreground">{stats.departments}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/50 dark:border-amber-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">New This Month</p>
                <p className="text-2xl font-bold text-foreground">{stats.newThisMonth}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-end">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground rotate-90" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="joinDate-desc">Join Date (New first)</option>
                  <option value="joinDate-asc">Join Date (Old first)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            All Employees ({totalEmployees || employees.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · Showing {employees.length} of {totalEmployees || employees.length}
          </p>
        </div>
        <Card>
          <CardContent>
          <div className="space-y-4">
            {loading && (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-lg border border-border/70 bg-muted/40 h-20"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && employees.length === 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No employees found for the current filters.
              </div>
            )}

            {!loading && !error && employees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar
                    src={employee.avatar}
                    alt={employee.name}
                    fallback={employee.name.split(' ').map(n => n[0]).join('')}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{employee.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </span>
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{employee.department || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{employee.designation || '—'}</span>
                    </div>
                  </div>
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {employee.joinDate
                          ? `Joined ${new Date(employee.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                          : 'Join date N/A'}
                      </span>
                    </div>
                    {employee.status && (
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {employees.length > 0
              ? `Showing ${(page - 1) * pageSize + 1} - ${(page - 1) * pageSize + employees.length} of ${totalEmployees || employees.length}`
              : 'Showing 0 results'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => handlePageChange('prev')}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange('next')}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

function normalizeEmployeesResponse(response: any): { items: StoredEmployee[]; total: number } {
  let rawItems: any[] = [];
  let meta: any = {};

  if (response?.data?.data && Array.isArray(response.data.data)) {
    rawItems = response.data.data;
    meta = response.data.meta || response.meta || {};
  } else if (Array.isArray(response?.data)) {
    rawItems = response.data;
    meta = response.meta || {};
  } else if (Array.isArray(response?.employees)) {
    rawItems = response.employees;
    meta = response.meta || {};
  } else if (Array.isArray(response)) {
    rawItems = response;
  }

  const total =
    meta.total ||
    meta.totalItems ||
    meta.itemCount ||
    meta.count ||
    response?.total ||
    rawItems.length;

  const items: StoredEmployee[] = rawItems.map((emp, idx) => {
    const firstName = emp.firstName || emp.first_name || '';
    const lastName = emp.lastName || emp.last_name || '';
    const name = emp.name || [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed';
    const joinDate = emp.joinDate || emp.hireDate || emp.dateOfJoining || emp.createdAt;

    const departmentValue =
      emp.department?.name ||
      emp.departmentName ||
      emp.department ||
      emp.departmentId ||
      '';
    const designationValue =
      emp.designation?.title ||
      emp.designationName ||
      emp.designation ||
      '';

    return {
      id: String(emp.id ?? emp.employeeId ?? emp._id ?? idx),
      name,
      email: emp.email || '',
      phone: emp.phone || emp.contactNumber || emp.mobile || '',
      department: departmentValue,
      designation: designationValue,
      joinDate: joinDate || '',
      employeeId: String(emp.employeeId || emp.id || emp._id || idx),
      workCountry: emp.workCountry || emp.country || '',
      status: (emp.status || 'active') as 'active' | 'inactive',
      avatar: emp.avatar || emp.profileImageUrl || '',
    };
  });

  return { items, total };
}

