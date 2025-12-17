"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  Calendar, 
  Search, 
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ToastContainer, useToast } from '@/components/ui/Toast';

interface PendingLeave {
  id: string;
  employeeName: string;
  department?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  requestedOn: string;
  status: string;
}

export default function HRLeavePendingPage() {
  const { user } = useAuth();
  const approverEmployeeId = user?.employeeId;
  const { toasts, removeToast, success, error: showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PendingLeave | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design'];
  const leaveTypes = ['All Types', 'Casual Leave', 'Emergency Leave!', 'Sick Leave', 'Annual Leave', 'Unpaid Leave'];

  const filteredRequests = pendingLeaves.filter(req => {
    const matchesSearch =
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || req.department === selectedDepartment;
    const matchesType = selectedLeaveType === 'all' || req.type === selectedLeaveType;
    return matchesSearch && matchesDept && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchPendingLeaves = async (pageToLoad: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getPendingLeaves({ page: pageToLoad, limit });
      const root: any = res;

      const dataArray: any[] = Array.isArray(root.data)
        ? root.data
        : Array.isArray(root?.data?.data)
          ? root.data.data
          : Array.isArray(root.items)
            ? root.items
            : Array.isArray(root.results)
              ? root.results
              : Array.isArray(root)
                ? root
                : [];

      const mapped: PendingLeave[] = dataArray.map((item: any) => {
        const employeeName =
          item.employeeName ??
          (item.employee
            ? `${item.employee.firstName ?? ''} ${item.employee.lastName ?? ''}`.trim()
            : 'Employee');

        const department =
          item.department ?? item.employee?.department ?? '—';

        const formatDate = (value?: string) => {
          if (!value) return '';
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) return value;
          return d.toISOString().slice(0, 10);
        };

        const start = item.startDate ?? item.fromDate;
        const end = item.endDate ?? item.toDate ?? start;

        return {
          id: item.id,
          employeeName,
          department,
          type: item.leaveType?.name ?? item.type ?? '',
          startDate: formatDate(start),
          endDate: formatDate(end),
          days: Number(item.totalDays ?? item.days ?? 0) || 0,
          reason: item.reason ?? '',
          requestedOn: formatDate(item.createdAt ?? item.requestedOn ?? start),
          status: item.status ?? 'pending',
        };
      });

      setPendingLeaves(mapped);
      setPage(pageToLoad);

      const meta = root.meta ?? root.data?.meta;
      if (meta && typeof meta.total === 'number') {
        setTotal(meta.total);
      } else {
        setTotal(mapped.length);
      }
    } catch (err: any) {
      console.error('Failed to load pending leaves', err);
      setError(err?.message ?? 'Failed to load pending leave requests.');
      showError(err?.message ?? 'Failed to load pending leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (request: PendingLeave, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType || !approverEmployeeId) {
      setShowActionModal(false);
      setSelectedRequest(null);
      setActionType(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      await api.updateLeaveStatus(selectedRequest.id, {
        status,
        approvedBy: approverEmployeeId,
      });

      success(
        `Leave request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`
      );

      setShowActionModal(false);
      setSelectedRequest(null);
      setActionType(null);

      fetchPendingLeaves(page);
    } catch (err: any) {
      console.error('Failed to update leave status', err);
      showError(err?.message ?? 'Failed to update leave status.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager', 'System Admin']}>
      <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Leave Requests</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Review and approve leave requests from employees</p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1">
          {total} Pending
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <NextUISelect
              // No label to keep text from overlapping inside the trigger
              placeholder="Select department"
              value={selectedDepartment === 'all' ? '' : selectedDepartment}
              onChange={(value) => setSelectedDepartment(value || 'all')}
              options={departments.map(dept => ({
                value: dept === 'All Departments' ? 'all' : dept,
                label: dept
              }))}
            />
            <NextUISelect
              // No label to keep text from overlapping inside the trigger
              placeholder="Select leave type"
              value={selectedLeaveType === 'all' ? '' : selectedLeaveType}
              onChange={(value) => setSelectedLeaveType(value || 'all')}
              options={leaveTypes.map(type => ({
                value: type === 'All Types' ? 'all' : type,
                label: type
              }))}
            />
            <Button variant="outline" className="h-11">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Leave Requests ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {isLoading && filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading pending leave requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {error || 'No pending leave requests'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar name={request.employeeName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {request.employeeName}
                          </h3>
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{request.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isMounted
                                ? `${new Date(request.startDate).toLocaleDateString('en-US')} - ${new Date(request.endDate).toLocaleDateString('en-US')}`
                                : `${new Date(request.startDate).toISOString().split('T')[0]} - ${new Date(request.endDate).toISOString().split('T')[0]}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{request.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{request.days} {request.days === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-muted/30 rounded-[6px]">
                          <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                          <p className="text-xs text-foreground">{request.reason}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Requested on{' '}
                          {isMounted
                            ? new Date(request.requestedOn).toLocaleDateString('en-US')
                            : new Date(request.requestedOn).toISOString().split('T')[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, 'approve')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, 'reject')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => fetchPendingLeaves(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => fetchPendingLeaves(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Action Modal */}
      <Modal 
        isOpen={showActionModal} 
        onClose={() => {
          setShowActionModal(false);
          setSelectedRequest(null);
          setActionType(null);
        }} 
        title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-[8px]">
              <p className="text-sm text-muted-foreground mb-1">Employee:</p>
              <p className="text-sm font-semibold text-foreground">
                {selectedRequest.employeeName}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-[8px]">
              <p className="text-sm text-muted-foreground mb-1">Leave Details:</p>
              <p className="text-sm text-foreground">
                {selectedRequest.type} - {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isMounted
                  ? `${new Date(selectedRequest.startDate).toLocaleDateString('en-US')} to ${new Date(selectedRequest.endDate).toLocaleDateString('en-US')}`
                  : `${new Date(selectedRequest.startDate).toISOString().split('T')[0]} to ${new Date(selectedRequest.endDate).toISOString().split('T')[0]}`
                }
              </p>
            </div>
            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Rejection Reason</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isSubmittingAction}
                className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isSubmittingAction
                  ? 'Processing...'
                  : actionType === 'approve'
                  ? 'Approve'
                  : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
    </ProtectedRoute>
  );
}

