"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Search,
  Download,
  Laptop,
  Home,
  FileText,
  TrendingUp,
  User,
  Users,
  MoreVertical,
  Edit,
  Coffee,
  Pencil,
  ArrowUp,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ClockEntry = {
  time: string;
  type: 'in' | 'out' | 'missing';
  location?: string;
  note?: string;
};

type AttendanceLog = {
  id?: string | number;
  date: string;
  dayLabel?: string;
  visual: string[];
  effectiveHours: string;
  grossHours: string;
  arrival: string;
  log: string;
  label?: string;
  status?: string;
  shiftName?: string;
  shiftWindow?: string;
  entries?: ClockEntry[];
};

type AttendanceRequest = {
  id: string | number;
  type: string;
  date: string;
  status: string;
  reason?: string;
};

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
  const DEFAULT_PAGE_SIZE = 10;
  const [selectedRange, setSelectedRange] = useState('lastWeek');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedFilter, setSelectedFilter] = useState('last30Days');
  const [activeTab, setActiveTab] = useState<'logs' | 'requests'>('logs');
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [dropdownPositions, setDropdownPositions] = useState<Record<number, { vertical: 'bottom' | 'top'; horizontal: 'left' | 'right' }>>({});
  const [showWFHModal, setShowWFHModal] = useState(false);
  const [showPartialDayModal, setShowPartialDayModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 });
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Timings state
  const getCurrentDayName = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };
  const currentDayName = getCurrentDayName();
  const [selectedDay, setSelectedDay] = useState(currentDayName);
  
  const timings = {
    'Mon': { type: 'Regular', start: '09:00', end: '18:00', break: 60 },
    'Tue': { type: 'Flexible', start: '09:30', end: '18:30', break: 60 },
    'Wed': { type: 'Regular', start: '09:00', end: '18:00', break: 60 },
    'Thu': { type: 'Regular', start: '09:00', end: '18:00', break: 60 },
    'Fri': { type: 'Regular', start: '09:00', end: '18:00', break: 60 },
    'Sat': { type: 'Week Off', start: '-', end: '-', break: 0 },
    'Sun': { type: 'Week Off', start: '-', end: '-', break: 0 },
  };
  
  const currentTiming = timings[selectedDay as keyof typeof timings];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside the dropdown menu
      const dropdownElement = document.querySelector(`[data-dropdown-index="${openDropdownIndex}"]`);
      const buttonElement = document.querySelector(`[data-dropdown-button="${openDropdownIndex}"]`);
      
      if (openDropdownIndex !== null) {
        // Check if click is outside both the dropdown and its trigger button
        if (
          dropdownElement && 
          !dropdownElement.contains(target) && 
          buttonElement &&
          !buttonElement.contains(target)
        ) {
          setOpenDropdownIndex(null);
        }
      }
    };

    if (openDropdownIndex !== null) {
      // Use mousedown instead of click for better responsiveness
      document.addEventListener('mousedown', handleClickOutside);
      // Also listen for click as fallback
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownIndex]);

  const attendanceStats = {
    lastWeek: { avgHours: '8h 1m', onTime: '100%', totalHours: '40:09', workingDays: 5 },
    lastMonth: { avgHours: '8h 15m', onTime: '95%', totalHours: '165:30', workingDays: 20 },
    custom: { avgHours: '8h 5m', onTime: '98%', totalHours: '80:25', workingDays: 10 }
  };

  const getCurrentStats = () => {
    if (selectedRange === 'custom' && customDateRange.start && customDateRange.end) {
      return attendanceStats.custom;
    }
    return attendanceStats[selectedRange as keyof typeof attendanceStats];
  };

  const currentStats = getCurrentStats();
  const formatDateWithDay = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).format(d);
  };

  const formatTime = (value?: string | number | Date) => {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '-';
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatWorkHours = (hours?: string | number) => {
    if (hours === undefined || hours === null) return '0h 0m';
    const num = typeof hours === 'number' ? hours : Number(hours);
    if (Number.isNaN(num)) return '0h 0m';
    const totalMinutes = Math.round(num * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const totalLogsPages = Math.max(
    1,
    Math.ceil((logsPagination.total || attendanceLogs.length) / (logsPagination.limit || DEFAULT_PAGE_SIZE))
  );
  const totalRequestPages = Math.max(
    1,
    Math.ceil((requestsPagination.total || attendanceRequests.length) / (requestsPagination.limit || DEFAULT_PAGE_SIZE))
  );

  const extractItems = (source: any): any[] => {
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') {
      if (Array.isArray((source as any).items)) return (source as any).items;
      if (Array.isArray((source as any).data)) return (source as any).data;
      if (Array.isArray((source as any).rows)) return (source as any).rows;
      if (Array.isArray((source as any).list)) return (source as any).list;
      if (Array.isArray((source as any).results)) return (source as any).results;
    }
    return [];
  };

  const extractMeta = (
    source: any,
    fallbackTotal: number,
    fallbackLimit: number,
    fallbackPage: number
  ) => {
    const meta = source && typeof source === 'object' ? source : {};
    return {
      page: (meta as any).page ?? (meta as any).currentPage ?? fallbackPage ?? 1,
      limit: (meta as any).limit ?? (meta as any).perPage ?? (meta as any).pageSize ?? fallbackLimit ?? DEFAULT_PAGE_SIZE,
      total: (meta as any).total ?? (meta as any).totalItems ?? (meta as any).totalCount ?? (meta as any).count ?? fallbackTotal ?? 0,
    };
  };

  const mapEntries = (entries: any[]): ClockEntry[] => {
    return entries.map((entry) => {
      const rawType = (entry?.type ?? entry?.direction ?? entry?.logType ?? entry?.status ?? '').toString().toLowerCase();
      const type: ClockEntry['type'] =
        rawType.includes('out') ? 'out' : rawType.includes('miss') ? 'missing' : 'in';

      const timeValue = entry?.time ?? entry?.timestamp ?? entry?.at ?? entry?.clockAt ?? entry?.punchTime;
      return {
        time: formatTime(timeValue),
        type,
        location: entry?.location ?? entry?.door ?? entry?.device ?? entry?.place,
        note: entry?.note ?? entry?.remark ?? entry?.status ?? '',
      };
    });
  };

  const mapLog = (item: any): AttendanceLog => {
    const entriesSource =
      item?.entries ??
      item?.logs ??
      item?.clockEntries ??
      item?.punches ??
      item?.events ??
      [];

    const derivedEntries: ClockEntry[] = [];
    if (item?.checkIn) {
      derivedEntries.push({
        time: formatTime(item.checkIn),
        type: 'in',
        location: item?.checkInLocation ?? item?.location ?? undefined,
      });
    }
    if (item?.checkOut) {
      derivedEntries.push({
        time: formatTime(item.checkOut),
        type: 'out',
        location: item?.checkOutLocation ?? item?.location ?? undefined,
      });
    }

    const start = item?.shiftStart ?? item?.startTime ?? item?.shift_start;
    const end = item?.shiftEnd ?? item?.endTime ?? item?.shift_end;
    const shiftWindow = start && end
      ? `${formatTime(start)} - ${formatTime(end)}`
      : item?.shiftWindow ??
        (derivedEntries.length
          ? `${derivedEntries[0]?.time ?? '-'} - ${derivedEntries[derivedEntries.length - 1]?.time ?? '-'}`
          : undefined);

    return {
      id: item?.id ?? item?._id ?? item?.logId,
      date: formatDateWithDay(item?.date ?? item?.day ?? item?.attendanceDate ?? item?.loggedAt ?? item?.logDate),
      dayLabel: item?.dayLabel,
      visual: Array.isArray(item?.visual)
        ? item.visual
        : Array.isArray(item?.timeBlocks)
        ? item.timeBlocks
        : [],
      effectiveHours:
        item?.effectiveHours ??
        item?.effective_hours ??
        item?.effective_hours_label ??
        item?.effective ??
        item?.totalEffectiveHours ??
        formatWorkHours(item?.workHours),
      grossHours: item?.grossHours ?? item?.gross_hours ?? item?.totalHours ?? item?.totalDuration ?? formatWorkHours(item?.workHours),
      arrival: item?.arrival ?? item?.arrivalStatus ?? item?.arrival_status ?? item?.checkInStatus ?? 'On Time',
      log: (item?.log ?? item?.logStatus ?? item?.status ?? 'none').toString().toLowerCase(),
      label: item?.label ?? item?.type ?? item?.dayType,
      status: item?.status ?? item?.attendanceStatus ?? item?.state,
      shiftName: item?.shiftName ?? item?.shift ?? 'Flexible shift',
      shiftWindow: shiftWindow ?? undefined,
      entries: [
        ...derivedEntries,
        ...mapEntries(Array.isArray(entriesSource) ? entriesSource : []),
      ],
    };
  };

  const mergeLogsByDate = (logs: AttendanceLog[]) => {
    const seen = new Map<string, AttendanceLog>();
    const ordered: AttendanceLog[] = [];

    logs.forEach((log) => {
      const key = log.date;
      if (!seen.has(key)) {
        const clone: AttendanceLog = {
          ...log,
          entries: [...(log.entries ?? [])],
        };
        seen.set(key, clone);
        ordered.push(clone);
      } else {
        const existing = seen.get(key)!;
        existing.entries = [...(existing.entries ?? []), ...(log.entries ?? [])];
        // Prefer meaningful hours/gross/arrival if existing is empty
        const hasEffective = existing.effectiveHours && existing.effectiveHours !== '-' && existing.effectiveHours !== '0h 0m';
        if (!hasEffective && log.effectiveHours) existing.effectiveHours = log.effectiveHours;
        const hasGross = existing.grossHours && existing.grossHours !== '-';
        if (!hasGross && log.grossHours) existing.grossHours = log.grossHours;
        if (!existing.arrival && log.arrival) existing.arrival = log.arrival;
        if (!existing.label && log.label) existing.label = log.label;
        if (!existing.status && log.status) existing.status = log.status;
        if (!existing.shiftName && log.shiftName) existing.shiftName = log.shiftName;
        if (!existing.shiftWindow && log.shiftWindow) existing.shiftWindow = log.shiftWindow;
      }
    });

    return ordered.map((log) => {
      if (!log.shiftWindow && (log.entries?.length ?? 0) > 0) {
        const times = (log.entries ?? [])
          .map((e) => e.time)
          .filter(Boolean);
        if (times.length >= 1) {
          const first = times[0];
          const last = times[times.length - 1];
          log.shiftWindow = `${first} - ${last}`;
        }
      }
      return log;
    });
  };

  const mapRequest = (item: any, idx = 0): AttendanceRequest => ({
    id: item?.id ?? item?.requestId ?? item?._id ?? idx,
    type: item?.type ?? item?.requestType ?? 'Request',
    date: formatDateWithDay(item?.date ?? item?.appliedOn ?? item?.createdAt ?? '-'),
    status: item?.status ?? item?.state ?? 'Pending',
    reason: item?.reason ?? item?.description ?? item?.comments ?? '',
  });

  const fetchAttendanceData = async () => {
    if (!user?.employeeId) return;
    try {
      setIsLoading(true);
      setError(null);

      const currentPage = activeTab === 'logs' ? logsPagination.page : requestsPagination.page;
      const currentLimit = activeTab === 'logs' ? logsPagination.limit : requestsPagination.limit;

      const response = await api.getEmployeeAttendance(user.employeeId, {
        page: currentPage,
        limit: currentLimit,
        filter: activeTab === 'logs' ? selectedFilter : undefined,
        tab: activeTab,
      });

      const root = (response as any)?.data ?? response ?? {};

      const logsContainer =
        (root as any).attendanceLogs ??
        (root as any).logs ??
        (root as any).log ??
        (root as any).data?.logs ??
        (Array.isArray(root) ? root : (root as any).data ?? []);

      const requestsContainer =
        (root as any).attendanceRequests ??
        (root as any).requests ??
        (root as any).request ??
        (root as any).data?.requests ??
        [];

      const logsItems = extractItems(logsContainer);
      const requestsItems = extractItems(requestsContainer);

      const mappedLogs = logsItems.map(mapLog);
      setAttendanceLogs(mergeLogsByDate(mappedLogs));
      setAttendanceRequests(requestsItems.map(mapRequest));

      const logsMeta = extractMeta(
        (logsContainer && typeof logsContainer === 'object'
          ? (logsContainer as any).meta ?? (logsContainer as any).pagination ?? (logsContainer as any).pageInfo
          : null) ??
          (root as any).logsMeta ??
          (root as any).logsPagination ??
          (root as any).pagination ??
          (root as any).meta,
        logsItems.length,
        logsPagination.limit,
        logsPagination.page
      );

      const requestsMeta = extractMeta(
        (requestsContainer && typeof requestsContainer === 'object'
          ? (requestsContainer as any).meta ?? (requestsContainer as any).pagination ?? (requestsContainer as any).pageInfo
          : null) ??
          (root as any).requestsMeta ??
          (root as any).requestsPagination ??
          (root as any).pagination ??
          (root as any).meta,
        requestsItems.length,
        requestsPagination.limit,
        requestsPagination.page
      );

      setLogsPagination((prev) => ({
        page: logsMeta.page ?? prev.page,
        limit: logsMeta.limit ?? prev.limit,
        total: logsMeta.total ?? prev.total,
      }));

      setRequestsPagination((prev) => ({
        page: requestsMeta.page ?? prev.page,
        limit: requestsMeta.limit ?? prev.limit,
        total: requestsMeta.total ?? prev.total,
      }));
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
      setAttendanceLogs([]);
      setAttendanceRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.employeeId) return;
    fetchAttendanceData();
  }, [activeTab, logsPagination.page, requestsPagination.page, selectedFilter, user?.employeeId]);

  useEffect(() => {
    if (activeTab === 'logs') {
      setLogsPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [selectedFilter, activeTab]);

  useEffect(() => {
    setOpenDropdownIndex(null);
  }, [activeTab]);

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageTitle 
            size="xl" 
            description="View your attendance records, request changes, and track your hours"
          >
            My Attendance
          </PageTitle>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Attendance Statistics */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Attendance Statistics</CardTitle>
              <div className="flex items-center gap-2">
                {selectedRange === 'custom' ? (
                  <DateRangePicker
                    value={customDateRange}
                    onChange={(range) => {
                      setCustomDateRange(range);
                      if (range.start && range.end) {
                        setSelectedRange('custom');
                      }
                    }}
                    className="w-auto min-w-[200px]"
                  />
                ) : (
                  <NextUISelect
                    placeholder="Select range"
                    value={selectedRange}
                    onChange={(value) => {
                      if (value === 'custom') {
                        setSelectedRange('custom');
                      } else {
                        setSelectedRange(value);
                      }
                    }}
                    options={[
                      { value: 'lastWeek', label: 'Last Week' },
                      { value: 'lastMonth', label: 'Last Month' },
                      { value: 'custom', label: 'Custom Range' }
                    ]}
                    classNames={{
                      base: "w-auto min-w-[150px]",
                    }}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Average Hours/Day</p>
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentStats.avgHours}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 rounded-xl border-2 border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">On-Time Arrival</p>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentStats.onTime}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 rounded-xl border-2 border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentStats.totalHours}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 rounded-xl border-2 border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Working Days</p>
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{currentStats.workingDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
                  
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role && user.role.some((r) => hasPermission(r, PERMISSIONS.REQUEST_WFH)) && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWFHModal(true)}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/30 border-2 border-blue-200/60 dark:border-blue-800/40 rounded-xl transition-all hover:border-blue-300 dark:hover:border-blue-700 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Work From Home</div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Request WFH</div>
                </div>
              </div>
            </motion.button>
          )}
          
          {user?.role && user.role.some((r) => hasPermission(r, PERMISSIONS.REQUEST_PARTIAL_DAY)) && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPartialDayModal(true)}
              className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30 border-2 border-amber-200/60 dark:border-amber-800/40 rounded-xl transition-all hover:border-amber-300 dark:hover:border-amber-700 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">Partial Day</div>
                  <div className="text-xs text-amber-600/70 dark:text-amber-400/70">Request partial day</div>
                </div>
              </div>
            </motion.button>
          )}

          {user?.role && user.role.some((r) => hasPermission(r, PERMISSIONS.REGULARIZE_ATTENDANCE)) && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegularizeModal(true)}
              className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl transition-all hover:border-primary/40 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Regularize</div>
                  <div className="text-xs text-muted-foreground">Request attendance correction</div>
                </div>
              </div>
            </motion.button>
          )}
        </div>

        {/* Timings */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <CardTitle className="text-xl font-bold">Timings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-[4px] flex items-center justify-center text-xs font-semibold transition-all ${
                      selectedDay === day
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                        : 'bg-muted/50 text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="relative p-3.5 bg-gradient-to-br from-primary/8 to-primary/3 rounded-[8px] border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">
                    {selectedDay === currentDayName ? 'Today' : selectedDay} ({currentTiming.type})
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Coffee className="h-3 w-3" />
                    <span>{currentTiming.break} min</span>
                  </div>
                </div>
                <div className="relative h-3 bg-primary/15 rounded-full overflow-hidden border border-primary/20">
                  <div className="absolute inset-0 flex items-center">
                    <div className="flex-1 h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80"></div>
                    <div className="w-1 h-full bg-background border-l border-r border-primary/20"></div>
                    <div className="flex-1 h-full bg-gradient-to-r from-primary/80 via-primary/90 to-primary"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>Duration: 23h 59m</span>
                  <span className="font-medium">{currentTiming.start} - {currentTiming.end}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs & Requests */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Logs & Requests</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 border border-border/60 rounded-[8px] p-0.5 bg-muted/30 h-10">
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-2 rounded-[8px] text-xs font-semibold transition-all h-full flex items-center ${
                      activeTab === 'logs' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    Attendance Log
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-3 py-2 rounded-[8px] text-xs font-semibold transition-all h-full flex items-center ${
                      activeTab === 'requests' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    Attendance Requests
                  </button>
                </div>
                {activeTab === 'logs' && (
                  <div className="h-10">
                    <NextUISelect
                      placeholder="Filter"
                      value={selectedFilter}
                      onChange={setSelectedFilter}
                      options={[
                        { value: 'last30Days', label: 'Last 30 Days' },
                        { value: 'lastWeek', label: 'Last Week' },
                        { value: 'lastMonth', label: 'Last Month' }
                      ]}
                      classNames={{
                        base: "w-[140px]",
                        trigger: "h-10",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 overflow-visible">
            {activeTab === 'logs' ? (
              isLoading ? (
                <div className="flex justify-center py-10">
                  <Loading />
                </div>
              ) : error ? (
                <ErrorState
                  title="Unable to load attendance"
                  message={error}
                  onRetry={fetchAttendanceData}
                />
              ) : attendanceLogs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-6">
                  No attendance logs found.
                </div>
              ) : (
                <div className="space-y-2 overflow-visible">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/40 rounded-[8px] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border border-border/40">
                    <div className="col-span-2">DATE</div>
                    <div className="col-span-3">ATTENDANCE VISUAL</div>
                    <div className="col-span-2">EFFECTIVE HOURS</div>
                    <div className="col-span-2">GROSS HOURS</div>
                    <div className="col-span-2">ARRIVAL</div>
                    <div className="col-span-1 text-center">LOG</div>
                  </div>
                  {/* Table Rows */}
                  {attendanceLogs.map((log, idx) => {
                    const isWeeklyOff =
                      log.effectiveHours === 'Full day Weekly-off' ||
                      log.status === 'weekoff' ||
                      (log.label ?? '').toLowerCase().includes('off');

                    const clockIns = (log.entries ?? []).filter((e) => e.type === 'in');
                    const clockOuts = (log.entries ?? []).filter((e) => e.type === 'out' || e.type === 'missing');

                    return (
                      <div key={log.id ?? idx} className="relative overflow-visible">
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`grid grid-cols-12 gap-4 px-4 py-3 border border-border/40 rounded-[8px] transition-all group ${
                            log.label === 'W-OFF' 
                              ? 'bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100/70 dark:hover:bg-slate-900/30' 
                              : log.label === 'LEAVE'
                              ? 'bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/30'
                              : log.label === 'WFH'
                              ? 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30'
                              : idx % 2 === 0
                              ? 'bg-card hover:bg-accent/30 hover:border-primary/20'
                              : 'bg-gray-50/50 dark:bg-gray-900/10 hover:bg-accent/30 hover:border-primary/20'
                          }`}
                        >
                          <div className="col-span-2 flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">{log.date}</span>
                            {log.label && (
                              <Badge 
                                variant={log.label === 'W-OFF' ? 'info' : log.label === 'WFH' ? 'info' : 'warning'} 
                                className="text-[9px] px-1.5 py-0 h-4"
                              >
                                {log.label}
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-3 flex items-center" title={log.visual.length > 0 ? log.visual.join(', ') : 'No attendance data'}>
                            <div className="flex gap-0.5 w-full h-3">
                              {log.visual.length > 0 ? (
                                log.visual.map((v, i) => (
                                  <div key={i} className="h-full flex-1 bg-primary rounded-[8px] shadow-sm" title={v}></div>
                                ))
                              ) : (
                                <div className="h-full w-full bg-muted/50 rounded-[8px]"></div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center gap-1.5">
                            {log.effectiveHours !== 'Full day Weekly-off' && log.effectiveHours !== 'Sick Leave' && (
                              <div 
                                className={`w-1.5 h-1.5 rounded-full ${log.effectiveHours !== '0h 0m' && !log.effectiveHours.includes('0h 0m') ? 'bg-primary' : 'border border-primary'}`}
                                title={log.effectiveHours}
                              ></div>
                            )}
                            <span className="text-xs font-medium text-foreground tabular-nums">{log.effectiveHours}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-xs font-medium text-foreground tabular-nums">{log.grossHours}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            {log.arrival !== '-' && (
                              <div className="flex items-center gap-1.5" title={`Arrival: ${log.arrival}`}>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs font-medium text-foreground">{log.arrival}</span>
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 flex items-center justify-center relative">
                            {(() => {
                              const clockIns = (log.entries ?? []).filter((e) => e.type === 'in');
                              const clockOuts = (log.entries ?? []).filter((e) => e.type === 'out');
                              const missingOuts = (log.entries ?? []).filter((e) => e.type === 'missing');
                              
                              // Determine status message and icon
                              let statusMessage = '';
                              let iconElement: any = null;
                              
                              if (isWeeklyOff || log.status === 'weekoff' || log.label === 'W-OFF') {
                                statusMessage = 'Weekly Off';
                                iconElement = <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />;
                              } else if (log.label === 'LEAVE') {
                                statusMessage = 'Leave';
                                iconElement = <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />;
                              } else if (missingOuts.length > 0 || (clockIns.length > 0 && clockOuts.length === 0 && missingOuts.length === 0)) {
                                // Missing swipe(s) - check if there are unmatched clock-ins
                                const unmatchedIns = clockIns.length - clockOuts.length;
                                if (unmatchedIns > 0 || missingOuts.length > 0) {
                                  statusMessage = 'Present | Missing Swipe(s)';
                                  iconElement = (
                                    <div className="relative">
                                      <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                        <AlertCircle className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                      </div>
                                    </div>
                                  );
                                } else {
                                  statusMessage = 'On Time';
                                  iconElement = (
                                    <div className="relative">
                                      <div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-green-500 fill-green-500" />
                                      </div>
                                    </div>
                                  );
                                }
                              } else if (log.log === 'success' || (clockIns.length > 0 && clockOuts.length > 0 && missingOuts.length === 0)) {
                                statusMessage = 'On Time';
                                iconElement = (
                                  <div className="relative">
                                    <div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
                                      <CheckCircle2 className="h-2.5 w-2.5 text-green-500 fill-green-500" />
                                    </div>
                                  </div>
                                );
                              } else if (log.log === 'warning') {
                                statusMessage = 'Present | Missing Swipe(s)';
                                iconElement = (
                                  <div className="relative">
                                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                      <AlertCircle className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    </div>
                                  </div>
                                );
                              } else {
                                statusMessage = 'Pending';
                                iconElement = <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />;
                              }
                              
                              return (
                                <button
                                  data-dropdown-button={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const button = e.currentTarget;
                                    const rect = button.getBoundingClientRect();
                                    const viewportHeight = window.innerHeight;
                                    const spaceBelow = viewportHeight - rect.bottom;
                                    const spaceAbove = rect.top;
                                    
                                    const dropdownHeight = isWeeklyOff ? 200 : 360;
                                    const padding = 8;
                                    
                                    let vertical: 'bottom' | 'top' = 'bottom';
                                    
                                    if (spaceBelow >= dropdownHeight + padding) {
                                      vertical = 'bottom';
                                    } else if (spaceAbove >= dropdownHeight + padding) {
                                      vertical = 'top';
                                    } else {
                                      vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';
                                    }
                                    
                                    setDropdownPositions(prev => ({ 
                                      ...prev, 
                                      [idx]: { 
                                        vertical, 
                                        horizontal: 'right' as const
                                      } 
                                    }));
                                    setOpenDropdownIndex(openDropdownIndex === idx ? null : idx);
                                  }}
                                  className="p-1 hover:bg-accent rounded transition-colors group-hover:opacity-100 opacity-60 relative"
                                  title={statusMessage}
                                >
                                  {iconElement}
                                </button>
                              );
                            })()}
                            {/* Dropdown Menu */}
                            {openDropdownIndex === idx && dropdownPositions[idx] && (
                              <>
                                {/* Backdrop overlay for click outside */}
                                <div
                                  className="fixed inset-0 z-[99]"
                                  onClick={() => setOpenDropdownIndex(null)}
                                />
                                <div 
                                  data-dropdown-index={idx}
                                  className={cn(
                                    "absolute z-[100] bg-background border border-border rounded-[8px] shadow-lg",
                                    dropdownPositions[idx]?.vertical === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
                                    dropdownPositions[idx]?.horizontal === 'right' ? 'right-0' : 'left-0'
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    width: isWeeklyOff ? '210px' : '320px',
                                    maxWidth: 'calc(100vw - 32px)',
                                    maxHeight: isWeeklyOff ? '220px' : '420px',
                                    overflowY: 'auto',
                                  }}
                                >
                                  {isWeeklyOff ? (
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setShowRegularizeModal(true);
                                          setOpenDropdownIndex(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                      >
                                        Regularize
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowWFHModal(true);
                                          setOpenDropdownIndex(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                      >
                                        Apply WFH Request
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowPartialDayModal(true);
                                          setOpenDropdownIndex(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                      >
                                        Apply Partial Day
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowLeaveModal(true);
                                          setOpenDropdownIndex(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                      >
                                        Request Leave
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="px-3 pt-2.5 pb-1.5 border-b border-border">
                                        <h3 className="text-sm font-semibold text-foreground">
                                          {log.shiftName ?? 'Shift'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {log.shiftWindow ?? '—'}
                                        </p>
                                      </div>

                                      <div className="px-1 py-0.5 border-b border-border">
                                        <button
                                          onClick={() => {
                                            setShowRegularizeModal(true);
                                            setOpenDropdownIndex(null);
                                          }}
                                          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
                                        >
                                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                          Regularize
                                        </button>
                                        <button
                                          onClick={() => {
                                            setShowPartialDayModal(true);
                                            setOpenDropdownIndex(null);
                                          }}
                                          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
                                        >
                                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                          Apply Partial Day
                                        </button>
                                      </div>

                                      <div className="px-3 py-2.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-xs font-semibold text-foreground">Clock entries</h4>
                                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                            {log.date}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            {clockIns.length > 0 ? clockIns.map((entry, entryIdx) => (
                                              <div key={entryIdx} className="flex items-center gap-2 text-xs text-foreground">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                <div className="flex flex-col leading-tight">
                                                  <span className="tabular-nums text-xs">{entry.time}</span>
                                                  {entry.location && <span className="text-[10px] text-muted-foreground">{entry.location}</span>}
                                                </div>
                                              </div>
                                            )) : (
                                              <p className="text-[11px] text-muted-foreground">No clock-ins</p>
                                            )}
                                          </div>
                                          
                                          <div className="space-y-2">
                                            {clockOuts.length > 0 ? clockOuts.map((entry, entryIdx) => (
                                              <div key={entryIdx} className="flex items-center gap-2 text-xs text-foreground">
                                                {entry.type === 'missing' ? (
                                                  <>
                                                    <ArrowUp className="h-3.5 w-3.5 text-red-500 shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                                    <span className="text-xs text-muted-foreground font-medium">MISSING</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <ArrowUp className="h-3.5 w-3.5 text-orange-500 shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                                    <div className="flex flex-col leading-tight">
                                                      <span className="tabular-nums text-xs">{entry.time}</span>
                                                      {entry.location && <span className="text-[10px] text-muted-foreground">{entry.location}</span>}
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            )) : (
                                              <p className="text-[11px] text-muted-foreground">No clock-outs</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                              </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {logsPagination.total > logsPagination.limit && (
                    <div className="flex items-center justify-between px-4 pt-4">
                      <span className="text-xs text-muted-foreground">
                        Page {logsPagination.page} of {totalLogsPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={logsPagination.page <= 1 || isLoading}
                          onClick={() =>
                            setLogsPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                          }
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={logsPagination.page >= totalLogsPages || isLoading}
                          onClick={() =>
                            setLogsPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loading />
                  </div>
                ) : error ? (
                  <ErrorState
                    title="Unable to load requests"
                    message={error}
                    onRetry={fetchAttendanceData}
                  />
                ) : attendanceRequests.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-6">
                    No attendance requests found.
                  </div>
                ) : (
                  <>
                    {attendanceRequests.map((req, idx) => (
                      <motion.div
                        key={req.id ?? idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="info" className="text-[10px] px-1.5 py-0.5">{req.type}</Badge>
                            <span className="text-xs font-semibold text-foreground">{req.date}</span>
                          </div>
                          <Badge variant={req.status === 'Approved' ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0.5">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{req.reason}</p>
                      </motion.div>
                    ))}

                    {requestsPagination.total > requestsPagination.limit && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Page {requestsPagination.page} of {totalRequestPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={requestsPagination.page <= 1 || isLoading}
                            onClick={() =>
                              setRequestsPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={requestsPagination.page >= totalRequestPages || isLoading}
                            onClick={() =>
                              setRequestsPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Requests - Remove this duplicate section */}


        {/* Modals */}
        <Modal isOpen={showWFHModal} onClose={() => setShowWFHModal(false)} title="Request Work From Home" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date <span className="text-red-500">*</span></label>
              <Input type="date" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter reason for WFH request..."
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowWFHModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showPartialDayModal} onClose={() => setShowPartialDayModal(false)} title="Request Partial Day" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date <span className="text-red-500">*</span></label>
              <Input type="date" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Time <span className="text-red-500">*</span></label>
                <Input type="time" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Time <span className="text-red-500">*</span></label>
                <Input type="time" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter reason for partial day..."
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowPartialDayModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showRegularizeModal} onClose={() => setShowRegularizeModal(false)} title="Regularize Attendance" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date <span className="text-red-500">*</span></label>
              <Input type="date" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Check In <span className="text-red-500">*</span></label>
                <Input type="time" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Check Out <span className="text-red-500">*</span></label>
                <Input type="time" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter reason for regularization..."
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowRegularizeModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Request Leave" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Leave Type <span className="text-red-500">*</span></label>
              <NextUISelect
                placeholder="Select leave type"
                options={[
                  { value: 'casual', label: 'Casual Leave' },
                  { value: 'sick', label: 'Sick Leave' },
                  { value: 'annual', label: 'Annual Leave' },
                  { value: 'emergency', label: 'Emergency Leave' },
                  { value: 'unpaid', label: 'Unpaid Leave' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Start Date <span className="text-red-500">*</span></label>
              <Input type="date" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">End Date <span className="text-red-500">*</span></label>
              <Input type="date" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter reason for leave request..."
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
