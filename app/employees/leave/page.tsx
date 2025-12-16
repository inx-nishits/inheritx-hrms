"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { 
  Calendar, Plus, Download, Check, X, Clock, Eye, 
  Search, MoreVertical, Info, TrendingUp, Coffee
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { filterDataByRole } from '@/lib/auth';
import { api } from '@/lib/api';
import { ToastContainer, useToast } from '@/components/ui/Toast';

interface LeaveType {
  id: string;
  name: string;
  code?: string;
  annualQuota?: number;
}

interface LeaveBalanceApiResponse {
  data?: any;
  [key: string]: any;
}

interface EmployeeLeaveRequest {
  id: string;
  fromDate: string; // formatted date string
  toDate?: string; // formatted date string
  days: number; // total days
  leaveTypeName: string; // e.g. "Casual Leave"
  status: string;
  requestedBy?: string;
  actionOn?: string;
  note?: string;
  reason?: string;
}

export default function LeavePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;
  const { toasts, removeToast, success, error: showError } = useToast();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEncashmentModal, setShowEncashmentModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showCompOffHistory, setShowCompOffHistory] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState('All Types');
  const [selectedYear, setSelectedYear] = useState('Jan 2025 - Dec 2025');
  const [activePolicyTab, setActivePolicyTab] = useState('Birthday Leave');

  // Server-driven state
  const [leaveTypesData, setLeaveTypesData] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<
    {
      type: string;
      leaveTypeId: string;
      available: number;
      consumed: number;
      accrued: number;
      carryover: number;
      annual: number;
      color: string;
    }[]
  >([]);
  const [leaveHistory, setLeaveHistory] = useState<EmployeeLeaveRequest[]>([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<EmployeeLeaveRequest[]>([]);

  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Pagination for employee leave requests
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(1);
  const [hasMoreLeaveRequests, setHasMoreLeaveRequests] = useState(true);

  // Apply Leave form state
  const [applyLeaveType, setApplyLeaveType] = useState<string>('');
  const [applyStartDate, setApplyStartDate] = useState<string>('');
  const [applyEndDate, setApplyEndDate] = useState<string>('');
  const [applyReason, setApplyReason] = useState<string>('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const applyTotalDays = useMemo(() => {
    if (!applyStartDate || !applyEndDate) return 0;
    const start = new Date(applyStartDate);
    const end = new Date(applyEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [applyStartDate, applyEndDate]);

  // Simple, consistent color palette for leave types
  const leaveColors = ['#EF4444', '#10B981', '#F59E0B', '#FBBF24', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Fetch leave types and balances
  useEffect(() => {
    if (!employeeId) return;

    let isCancelled = false;
    const fetchData = async () => {
      setIsLoadingBalances(true);
      setBalancesError(null);
      try {
        const typesResponse = await api.getLeaveTypes();
        const typesPayload = (typesResponse as any).data ?? typesResponse;
        const types: LeaveType[] = Array.isArray(typesPayload) ? typesPayload : typesPayload.items ?? [];

        if (!Array.isArray(types)) {
          throw new Error('Unexpected leave types response');
        }

        if (isCancelled) return;
        setLeaveTypesData(types);

        // Fetch balances per type in parallel
        const balancesResponses = await Promise.all(
          types.map(async (t) => {
            try {
              const res: LeaveBalanceApiResponse = await api.getEmployeeLeaveBalance(employeeId, t.id);
              const payload = (res as any).data ?? res;

              const available =
                Number(
                  payload.balance ??
                  payload.available ??
                  payload.remaining ??
                  payload.availableBalance ??
                  0
                );
              const consumed =
                Number(
                  payload.used ??
                  payload.consumed ??
                  payload.totalConsumed ??
                  0
                );
              const accrued =
                Number(payload.accrued ?? payload.accruedSoFar ?? payload.totalAccrued ?? 0);
              const carryover =
                Number(payload.carryover ?? payload.carryForward ?? payload.carry_over ?? 0);
              const annual =
                Number(
                  payload.totalQuota ??
                  payload.annualQuota ??
                  payload.annual ??
                  t.annualQuota ??
                  available + consumed
                ) || available + consumed;

              return {
                type: t.name,
                leaveTypeId: t.id,
                available,
                consumed,
                accrued,
                carryover,
                annual,
              };
            } catch (error) {
              console.error('Failed to fetch balance for leave type', t, error);
              return {
                type: t.name,
                leaveTypeId: t.id,
                available: 0,
                consumed: 0,
                accrued: 0,
                carryover: 0,
                annual: t.annualQuota ?? 0,
              };
            }
          })
        );

        if (isCancelled) return;

        const enrichedBalances = balancesResponses.map((b, index) => ({
          ...b,
          // Assign colors deterministically
          color: leaveColors[index % leaveColors.length],
        }));

        setLeaveBalances(enrichedBalances);
      } catch (error: any) {
        console.error(error);
        if (!isCancelled) {
          setBalancesError(error?.message ?? 'Failed to load leave balances');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBalances(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [employeeId]);

  // Helper to load employee leave requests (history + pending)
  const loadEmployeeLeaves = useCallback(
    async (page: number, append: boolean = false) => {
      if (!employeeId) return;

      if (!append) {
        setIsLoadingHistory(true);
        setHistoryError(null);
      }

      try {
        const res = await api.getEmployeeLeaves(employeeId, { page, limit: 5 });
        const root: any = res;

        // Normalize different possible response shapes:
        // - { data: [...] }
        // - { data: { data: [...], meta: {...} } }
        // - { items: [...] } / { results: [...] }
        let rawItems: any[] = [];
        if (Array.isArray(root.data)) {
          rawItems = root.data;
        } else if (root.data && Array.isArray(root.data.data)) {
          rawItems = root.data.data;
        } else if (Array.isArray(root.items)) {
          rawItems = root.items;
        } else if (Array.isArray(root.results)) {
          rawItems = root.results;
        } else if (Array.isArray(root)) {
          rawItems = root;
        }

        const items: EmployeeLeaveRequest[] = rawItems.map((item: any) => {
          const fromDateIso = item.startDate ?? item.fromDate;
          const toDateIso = item.endDate ?? item.toDate ?? item.startDate ?? item.fromDate;

          const formatDate = (value?: string) => {
            if (!value) return '';
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return value;
            return d.toISOString().slice(0, 10);
          };

          const days = Number(item.totalDays ?? item.days ?? 0) || 0;

          const leaveTypeName =
            item.leaveTypeName ??
            item.leaveType?.name ??
            item.leaveType?.leaveType ??
            '';

          const requestedBy =
            item.requestedBy ??
            (item.employee
              ? `${item.employee.firstName ?? ''} ${item.employee.lastName ?? ''}`.trim()
              : user?.name ?? 'You');

          const actionOn = item.actionOn ?? item.createdAt ?? fromDateIso;

          return {
            id: item.id,
            fromDate: formatDate(fromDateIso),
            toDate: formatDate(toDateIso),
            days,
            leaveTypeName,
            status: item.status ?? '',
            requestedBy,
            actionOn: formatDate(actionOn),
            note: item.reason ?? item.note ?? '',
            reason: item.rejectReason ?? '',
          };
        });

        setHasMoreLeaveRequests(items.length === 5);
        setLeaveRequestsPage(page);

        setLeaveHistory((prev) => {
          const updated = append ? [...prev, ...items] : items;
          const pendingOnly = updated.filter((item) =>
            item.status?.toLowerCase().includes('pending')
          );
          setPendingLeaveRequests(pendingOnly);
          return updated;
        });
      } catch (error: any) {
        console.error('Failed to load leave history', error);
        setHistoryError(error?.message ?? 'Failed to load leave history');
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [employeeId]
  );

  // Initial fetch of leave history / requests
  useEffect(() => {
    if (!employeeId) return;
    loadEmployeeLeaves(1, false);
  }, [employeeId, loadEmployeeLeaves]);

  const compensatoryOffHistory = [
    { requestDate: '07 Jan 2025', days: 0.5, leaveType: 'Casual Leave', requestedOn: '08 Jan 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'Worked 4 hour due to project emergency' },
    { requestDate: '16 Feb 2025', days: 1, leaveType: 'Casual Leave', requestedOn: '19 Feb 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'worked on LIMS PDF report.- Approved from Ri...' },
    { requestDate: '01 Mar 2025', days: 1, leaveType: 'Casual Leave', requestedOn: '03 Apr 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'Leave credited Against working on Saturday du...' },
  ];

  const filteredHistory = useMemo(() => {
    return leaveHistory.filter((leave) => {
      if (selectedStatus !== 'All' && selectedStatus !== 'All Status') {
        if (!leave.status?.toLowerCase().includes(selectedStatus.toLowerCase())) return false;
      }
      if (selectedLeaveType !== 'All Types') {
        if (leave.leaveTypeName !== selectedLeaveType) return false;
      }
      return true;
    });
  }, [leaveHistory, selectedStatus, selectedLeaveType]);

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Leave Management</h1>
            <p className="text-muted-foreground">Manage leave requests, balances, and history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowApplyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <CardTitle className="text-xl font-bold">Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingHistory && pendingLeaveRequests.length === 0 ? (
              <div className="animate-pulse text-sm text-muted-foreground py-4">
                Loading pending requests...
              </div>
            ) : pendingLeaveRequests.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-semibold mb-2">Hurray! No pending leave requests</p>
                <p className="text-sm text-muted-foreground">Request leave on the right!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pendingLeaveRequests.map((req) => {
                  const dateLabel = req.toDate && req.toDate !== req.fromDate
                    ? `${req.fromDate} → ${req.toDate}, ${req.days} Day(s)`
                    : `${req.fromDate}, ${req.days} Day(s)`;
                  return (
                    <div key={req.id} className="p-4 border-2 border-border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{req.leaveTypeName}</p>
                        <p className="text-xs text-muted-foreground">{dateLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" className="text-xs">
                          {req.status}
                        </Badge>
                      </div>
                    </div>
                  );
                  })}
                </div>
                {hasMoreLeaveRequests && (
                  <div className="pt-3 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoadingHistory}
                      onClick={() => loadEmployeeLeaves(leaveRequestsPage + 1, true)}
                    >
                      {isLoadingHistory ? 'Loading...' : 'Load more'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Year Selector and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <NextUISelect
            placeholder="Select year"
            value={selectedYear}
            onChange={setSelectedYear}
            options={['Jan 2026 - Dec 2026', 'Jan 2025 - Dec 2025', 'Jan 2024 - Dec 2024']}
            classNames={{
              base: "w-[200px]",
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowEncashmentModal(true)}>
              Request Leave Encashment
            </Button>
            <Button variant="outline" onClick={() => setShowCompOffHistory(true)}>
              Compensatory Off Requests History
            </Button>
            <Button variant="outline" onClick={() => setShowPolicyModal(true)}>
              Leave Policy Explanation
            </Button>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoadingBalances && leaveBalances.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="border-2 border-border/50 rounded-xl p-4 space-y-4 animate-pulse bg-background/50"
              >
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-32 w-32 mx-auto rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : balancesError ? (
            <div className="col-span-full text-sm text-red-500 bg-red-500/5 border border-red-500/30 rounded-lg p-4">
              {balancesError}
            </div>
          ) : leaveBalances.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground bg-muted/30 border border-border rounded-lg p-4">
              No leave balances available.
            </div>
          ) : (
            leaveBalances.map((leave, idx) => {
              const annual = leave.annual || leave.available + leave.consumed;
              const percentage =
                annual === 0 || !Number.isFinite(annual)
                  ? 0
                  : Math.max(0, Math.min(100, (leave.available / annual) * 100));

              return (
                <motion.div
                  key={leave.leaveTypeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold">{leave.type}</CardTitle>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-2">
                            <svg className="transform -rotate-90 w-32 h-32">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-muted/20"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={leave.color}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                                className="transition-all duration-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold" style={{ color: leave.color }}>
                                {Number.isFinite(leave.available) ? leave.available : '∞'}
                              </span>
                              <span className="text-xs text-muted-foreground">Days Available</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span className="font-semibold">
                              {Number.isFinite(leave.available) ? leave.available : '∞'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Consumed:</span>
                            <span className="font-semibold">{leave.consumed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Accrued So Far:</span>
                            <span className="font-semibold">
                              {Number.isFinite(leave.accrued) ? leave.accrued : '∞'}
                            </span>
                          </div>
                          {leave.carryover > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Carryover:</span>
                              <span className="font-semibold">{leave.carryover}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Quota:</span>
                            <span className="font-semibold">
                              {Number.isFinite(annual) ? annual : '∞'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Other Leave Types */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Other Leave Types Available:</span> Birthday Leave, Marriage Anniversary Leave
            </p>
          </CardContent>
        </Card>

        {/* Leave History */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Leave History</CardTitle>
              <div className="flex items-center gap-2">
                <NextUISelect
                  placeholder="Leave Type"
                  value={selectedLeaveType}
                  onChange={setSelectedLeaveType}
                  options={[
                    'All Types',
                    ...leaveBalances.map((lb) => lb.type),
                  ]}
                  classNames={{
                    base: "w-[150px]",
                  }}
                />
                <NextUISelect
                  placeholder="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={['All Status', 'Approved', 'Pending', 'Rejected', 'Cancelled']}
                  classNames={{
                    base: "w-[150px]",
                  }}
                />
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="text" placeholder="Search..." className="pl-8 w-[200px]" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg font-semibold text-sm border border-border">
                <div className="col-span-2">LEAVE DATES</div>
                <div className="col-span-2">LEAVE TYPE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">REQUESTED BY</div>
                <div className="col-span-2">ACTION TAKEN ON</div>
                <div className="col-span-2">LEAVE NOTE</div>
              </div>
              {(() => {
                if (isLoadingHistory) {
                  return (
                    <div className="py-6 text-sm text-muted-foreground animate-pulse">
                      Loading leave history...
                    </div>
                  );
                }

                if (historyError) {
                  return (
                    <div className="py-4 text-sm text-red-500 bg-red-500/5 border border-red-500/30 rounded-lg px-4">
                      {historyError}
                    </div>
                  );
                }

                if (filteredHistory.length === 0) {
                  return (
                    <div className="py-6 text-sm text-muted-foreground text-center">
                      No leave history found for the selected filters.
                    </div>
                  );
                }

                return filteredHistory.map((leave, idx) => {
                  const dateLabel =
                    leave.toDate && leave.toDate !== leave.fromDate
                      ? `${leave.fromDate} → ${leave.toDate}, ${leave.days} Day(s)`
                      : `${leave.fromDate}, ${leave.days} Day(s)`;

                  const requestedBy = leave.requestedBy ?? (user?.name ? 'You' : 'Employee');
                  const actionOn = leave.actionOn ?? leave.fromDate;

                  return (
                    <motion.div
                      key={leave.id ?? idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="grid grid-cols-12 gap-4 p-4 border-2 border-border rounded-lg hover:bg-accent/50 hover:border-primary/30 transition-all"
                    >
                      <div className="col-span-2">
                        <span className="text-sm font-medium">{dateLabel}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm">{leave.leaveTypeName}</span>
                        <p className="text-xs text-muted-foreground">Requested on {actionOn}</p>
                      </div>
                      <div className="col-span-2">
                        <Badge
                          variant={
                            leave.status?.toLowerCase().includes('approved')
                              ? 'success'
                              : leave.status?.toLowerCase().includes('cancel')
                              ? 'danger'
                              : leave.status?.toLowerCase().includes('reject')
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm">{requestedBy}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm">{actionOn}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {leave.note}
                        </span>
                        {leave.reason && (
                          <p className="text-xs text-red-500 mt-1">Reason: {leave.reason}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Request Leave" size="md">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!employeeId) {
                setApplyError('Employee information is missing.');
                return;
              }

              const selectedLeave = leaveBalances.find((lb) => lb.type === applyLeaveType);
              if (!selectedLeave) {
                setApplyError('Please select a leave type.');
                return;
              }

              if (!applyStartDate || !applyEndDate || applyTotalDays <= 0) {
                setApplyError('Please select a valid date range.');
                return;
              }

              if (!applyReason.trim()) {
                setApplyError('Please provide a reason for your leave.');
                return;
              }

              setApplySubmitting(true);
              setApplyError(null);

              try {
                await api.createLeaveRequest({
                  employeeId,
                  leaveTypeId: selectedLeave.leaveTypeId,
                  startDate: applyStartDate,
                  endDate: applyEndDate,
                  totalDays: applyTotalDays,
                  status: 'pending',
                  reason: applyReason.trim(),
                });

                // Refresh pending + history
                loadEmployeeLeaves(1, false);

                // Reset form and close
                setApplyLeaveType('');
                setApplyStartDate('');
                setApplyEndDate('');
                setApplyReason('');
                setShowApplyModal(false);
                success('Leave request submitted successfully');
              } catch (error: any) {
                console.error('Failed to create leave request', error);
                const message =
                  error?.message ?? 'Failed to create leave request. Please try again.';
                setApplyError(message);
                showError(message);
              } finally {
                setApplySubmitting(false);
              }
            }}
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                placeholder="Select leave type"
                value={applyLeaveType}
                onChange={setApplyLeaveType}
                options={leaveBalances.map((lb) => lb.type)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                required
                value={applyStartDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplyStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                required
                value={applyEndDate}
                min={applyStartDate || undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplyEndDate(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total Days:{' '}
                <span className="font-bold text-foreground">
                  {applyTotalDays > 0 ? applyTotalDays : '-'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
                placeholder="Enter reason for leave..."
                required
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
              />
            </div>
            {applyError && (
              <p className="text-sm text-red-500">{applyError}</p>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={applySubmitting}>
                {applySubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowApplyModal(false);
                  setApplyError(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showEncashmentModal} onClose={() => setShowEncashmentModal(false)} title="Request Leave Encashment" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Select available leave type for encashment <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                placeholder="Select leave type"
                value=""
                onChange={() => {}}
                options={['Casual Leave', 'Sick Leave', 'Annual Leave']}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">How many leaves do you want to encash?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="quantity" value="all" defaultChecked className="w-4 h-4" />
                  <span>All</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="quantity" value="custom" className="w-4 h-4" />
                  <Input type="number" placeholder="Enter number" className="flex-1" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Note</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter note..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEncashmentModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Request</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showCompOffHistory} onClose={() => setShowCompOffHistory(false)} title="Compensatory Off Requests History" size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <NextUISelect
                placeholder="Status"
                value="All Status"
                onChange={() => {}}
                options={['All Status', 'Approved', 'Pending', 'Rejected']}
                classNames={{
                  base: "w-[150px]",
                }}
              />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Search..." className="pl-8 w-[200px]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg font-semibold text-sm border border-border">
                <div className="col-span-2">REQUEST DATES</div>
                <div className="col-span-2">LEAVE TYPE</div>
                <div className="col-span-2">NOTE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-3">REASON</div>
                <div className="col-span-1">ACTIONS</div>
              </div>
              {compensatoryOffHistory.map((comp, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 border-2 border-border rounded-lg hover:bg-accent/50 transition-all">
                  <div className="col-span-2">
                    <span className="text-sm font-medium">{comp.requestDate}</span>
                    <p className="text-xs text-muted-foreground">No. of Days - {comp.days}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{comp.leaveType}</span>
                    <p className="text-xs text-muted-foreground">Requested on {comp.requestedOn}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">{comp.note}</span>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="success">{comp.status}</Badge>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-muted-foreground">{comp.reason}</span>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Total: {compensatoryOffHistory.length}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>1 to {compensatoryOffHistory.length} of {compensatoryOffHistory.length}</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} title="Leave Policy Explanation" size="xl">
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
              {['Birthday Leave', 'Casual Leave', 'Emergency Leave!', 'Marriage Anniversary Leave', 'Sick Leave', 'Annual Leave', 'Unpaid Leave'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActivePolicyTab(type)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activePolicyTab === type
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{activePolicyTab}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activePolicyTab === 'Birthday Leave' 
                  ? "Birthday leave is a paid time off to observe an event, such as employee's birthday."
                  : "Leave policy details for " + activePolicyTab}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0.5</div>
                    <div className="text-xs text-muted-foreground">Days Available</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-sm">Consumed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </ProtectedRoute>
  );
}

