"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Calendar, Search, Building, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrganizationLeave {
  id: string;
  employeeName: string;
  employeeCode?: string;
  department?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  requestedOn: string;
  approverEmail?: string | null;
}

export default function HRLeaveAllPage() {
  const { toasts, removeToast, error: showError } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  >('all');
  const [leaves, setLeaves] = useState<OrganizationLeave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchAllLeaves = async (pageToLoad: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.getAllLeaves({
        page: pageToLoad,
        limit,
        sort: 'createdAt:desc',
      });

      const root: any = res;
      const dataRoot = root.data ?? {};

      // Backend shape (documented):
      // { success, statusCode, message, data: { items: [...], meta: {...} } }
      // Be defensive in case items are exposed differently.
      let items: any[] = [];
      if (Array.isArray((dataRoot as any).items)) {
        items = (dataRoot as any).items;
      } else if (Array.isArray((dataRoot as any).data)) {
        items = (dataRoot as any).data;
      } else if (Array.isArray(root.data)) {
        items = root.data;
      } else if (Array.isArray(root.items)) {
        items = root.items;
      } else if (Array.isArray(root)) {
        items = root;
      } else if (dataRoot && typeof dataRoot === 'object') {
        // Fallback: grab all child values that look like leave records (have status)
        items = Object.values(dataRoot).filter(
          (v: any) => v && typeof v === 'object' && 'status' in v
        ) as any[];
      }

      const mapped: OrganizationLeave[] = items.map((item: any) => {
        const employeeName =
          item.employeeName ??
          (item.employee
            ? `${item.employee.firstName ?? ''} ${item.employee.lastName ?? ''}`.trim()
            : 'Employee');

        const formatDate = (value?: string) => {
          if (!value) return '';
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) return value;
          return d.toISOString().slice(0, 10);
        };

        const start = item.startDate;
        const end = item.endDate ?? start;

        return {
          id: item.id,
          employeeName,
          employeeCode: item.employee?.employeeCode,
          department: item.employee?.department,
          type: item.leaveType?.name ?? '',
          status: item.status ?? 'pending',
          startDate: formatDate(start),
          endDate: formatDate(end),
          days: Number(item.totalDays ?? item.days ?? 0) || 0,
          reason: item.reason ?? '',
          requestedOn: formatDate(item.createdAt ?? start),
          approverEmail: item.approver?.email ?? null,
        };
      });

      setLeaves(mapped);
      setPage(pageToLoad);

      const meta = dataRoot.meta;
      if (meta && typeof meta.total === 'number') {
        setTotal(meta.total);
      } else {
        setTotal(mapped.length);
      }
    } catch (err: any) {
      console.error('Failed to load leave requests', err);
      const message = err?.message ?? 'Failed to load leave requests.';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLeaves = leaves.filter((leave) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      leave.employeeName.toLowerCase().includes(q) ||
      (leave.employeeCode ?? '').toLowerCase().includes(q) ||
      (leave.department ?? '').toLowerCase().includes(q) ||
      leave.type.toLowerCase().includes(q);

    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : leave.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusVariant = (
    status: string
  ): 'success' | 'warning' | 'danger' | 'default' => {
    const s = status.toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected' || s === 'cancelled') return 'danger';
    return 'default';
  };

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager', 'System Admin']}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              All Leave Requests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              View all leave requests across the organization
            </p>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1">
            Total: {total}
          </Badge>
        </div>

        {/* Filters */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by employee, code, department, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <NextUISelect
                // No label here to avoid overlapping with placeholder text
                placeholder="All Statuses"
                value={selectedStatus === 'all' ? '' : selectedStatus}
                onChange={(value) => setSelectedStatus((value as any) || 'all')}
                options={statusOptions}
              />
              <div className="flex items-center justify-end text-xs text-muted-foreground">
                <span>
                  Page {page} of {totalPages}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Leave Requests ({filteredLeaves.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {isLoading && filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50 animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    Loading leave requests...
                  </p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {error || 'No leave requests found for the selected filters.'}
                  </p>
                </div>
              ) : (
                filteredLeaves.map((leave, idx) => (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="p-4 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar name={leave.employeeName} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground">
                              {leave.employeeName}
                            </h3>
                            {leave.employeeCode && (
                              <span className="text-[10px] text-muted-foreground">
                                ({leave.employeeCode})
                              </span>
                            )}
                            <Badge
                              variant={getStatusVariant(leave.status)}
                              className="text-[9px] px-1.5 py-0 h-4 capitalize"
                            >
                              {leave.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>{leave.department || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {isMounted
                                  ? `${new Date(leave.startDate).toLocaleDateString(
                                      'en-US'
                                    )} - ${new Date(leave.endDate).toLocaleDateString(
                                      'en-US'
                                    )}`
                                  : `${leave.startDate} - ${leave.endDate}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>{leave.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {leave.days} {leave.days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 p-2 bg-muted/30 rounded-[6px]">
                            <p className="text-xs text-muted-foreground mb-1">
                              Reason:
                            </p>
                            <p className="text-xs text-foreground line-clamp-3">
                              {leave.reason}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2 flex flex-wrap gap-2">
                            <span>
                              Requested on{' '}
                              {isMounted
                                ? new Date(leave.requestedOn).toLocaleDateString('en-US')
                                : leave.requestedOn}
                            </span>
                            {leave.approverEmail && (
                              <span>• Approved by {leave.approverEmail}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => fetchAllLeaves(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => fetchAllLeaves(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </ProtectedRoute>
  );
}
