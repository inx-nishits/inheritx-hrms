"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
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

  // Mock attendance data - filtered by current user
  // In real app, fetch from API filtered by user.id
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

  // Mock attendance logs - In real app, filter by user.id
  // These are sample records for the current employee only
  const attendanceLogs = [
    { date: 'Tue, 11 Nov', visual: [], effectiveHours: '0h 0m +', grossHours: '0h 0m +', arrival: 'On Time', log: 'warning', status: 'pending' },
    { date: 'Mon, 10 Nov', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '9h 25m', grossHours: '10h 10m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Sun, 09 Nov', visual: [], effectiveHours: 'Full day Weekly-off', grossHours: 'Full day Weekly-off', arrival: '-', log: 'none', label: 'W-OFF', status: 'weekoff' },
    { date: 'Sat, 08 Nov', visual: [], effectiveHours: 'Full day Weekly-off', grossHours: 'Full day Weekly-off', arrival: '-', log: 'none', label: 'W-OFF', status: 'weekoff' },
    { date: 'Fri, 07 Nov', visual: ['09:00-12:00', '13:00-16:00'], effectiveHours: '6h 47m', grossHours: '9h 17m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Thu, 06 Nov', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 20m', grossHours: '9h 8m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Wed, 05 Nov', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 15m', grossHours: '9h 5m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Tue, 04 Nov', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 10m', grossHours: '9h 0m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Mon, 03 Nov', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 5m', grossHours: '8h 55m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Sun, 02 Nov', visual: [], effectiveHours: 'Full day Weekly-off', grossHours: 'Full day Weekly-off', arrival: '-', log: 'none', label: 'W-OFF', status: 'weekoff' },
    { date: 'Sat, 01 Nov', visual: [], effectiveHours: 'Full day Weekly-off', grossHours: 'Full day Weekly-off', arrival: '-', log: 'none', label: 'W-OFF', status: 'weekoff' },
    { date: 'Fri, 31 Oct', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 29m', grossHours: '9h 2m', arrival: 'On Time', log: 'none', label: 'WFH', status: 'wfh' },
    { date: 'Thu, 30 Oct', visual: [], effectiveHours: 'Sick Leave', grossHours: 'Sick Leave', arrival: '-', log: 'none', label: 'LEAVE', status: 'leave' },
    { date: 'Wed, 29 Oct', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 20m', grossHours: '9h 8m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Tue, 28 Oct', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 15m', grossHours: '9h 5m', arrival: 'On Time', log: 'success', status: 'present' },
    { date: 'Mon, 27 Oct', visual: ['09:00-13:00', '14:00-18:00'], effectiveHours: '8h 10m', grossHours: '9h 0m', arrival: 'On Time', log: 'success', status: 'present' },
  ];

  // Mock attendance requests - In real app, filter by user.id
  // These are sample requests for the current employee only
  const attendanceRequests = [
    { id: '1', type: 'WFH', date: '10 Nov 2025', status: 'Approved', reason: 'Work from home request' },
    { id: '2', type: 'Partial Day', date: '07 Nov 2025', status: 'Pending', reason: 'Medical appointment' },
  ];

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
                {attendanceLogs.map((log, idx) => (
                  <div key={idx} className="relative overflow-visible">
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
                        <button
                          data-dropdown-button={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            
                            // Check if this is a Weekly-off log
                            const isWeeklyOff = log.effectiveHours === 'Full day Weekly-off' || log.status === 'weekoff';
                            
                            // Updated dimensions for the dropdown - dynamic based on log type
                            const dropdownHeight = isWeeklyOff ? 180 : 320; // Simplified for weekly-off, full for others
                            const dropdownWidth = isWeeklyOff ? 200 : 260;
                            const padding = 8;
                            
                            let vertical: 'bottom' | 'top' = 'bottom';
                            
                            // VERTICAL POSITIONING - Check available space
                            if (spaceBelow >= dropdownHeight + padding) {
                              // Enough space below - open downward
                              vertical = 'bottom';
                            } else if (spaceAbove >= dropdownHeight + padding) {
                              // Not enough space below but enough above - flip upward
                              vertical = 'top';
                            } else {
                              // Use the side with more space
                              vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';
                            }
                            
                            // Store position values for absolute positioning (relative to button)
                            setDropdownPositions(prev => ({ 
                              ...prev, 
                              [idx]: { 
                                vertical, 
                                horizontal: 'right' as const
                              } 
                            }));
                            setOpenDropdownIndex(openDropdownIndex === idx ? null : idx);
                          }}
                          className="p-1 hover:bg-accent rounded transition-colors group-hover:opacity-100 opacity-60"
                          title="View actions"
                        >
                          {log.log === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          {log.log === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                          {(log.log === 'none' || !log.log) && <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
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
                                width: (log.effectiveHours === 'Full day Weekly-off' || log.status === 'weekoff') ? '200px' : '260px',
                                maxWidth: 'calc(100vw - 32px)',
                                maxHeight: (log.effectiveHours === 'Full day Weekly-off' || log.status === 'weekoff') ? '180px' : '320px',
                                overflowY: 'auto',
                              }}
                            >
                              {/* Conditional rendering: Simplified for Weekly-off, Full for others */}
                              {(log.effectiveHours === 'Full day Weekly-off' || log.status === 'weekoff') ? (
                                /* Action Buttons - Static Content for Weekly-off */
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
                                  {/* Shift Information */}
                                  <div className="px-3 pt-2.5 pb-1.5 border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground">Flexible shift (09 Dec)</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">9:28 AM - 5:28 PM</p>
                                  </div>

                                  {/* Action Buttons */}
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

                                  {/* Main Door Section */}
                                  <div className="px-3 py-2.5 space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground">Main door</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* Clock-in Column */}
                                      <div className="space-y-2">
                                        {[
                                          { time: '9:28:35 AM', type: 'in' },
                                          { time: '12:39:31 PM', type: 'in' },
                                          { time: '1:55:02 PM', type: 'in' }
                                        ].map((entry, entryIdx) => (
                                          <div key={entryIdx} className="flex items-center gap-2 text-xs text-foreground">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            <span className="tabular-nums text-xs">{entry.time}</span>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Clock-out Column */}
                                      <div className="space-y-2">
                                        {[
                                          { time: '12:38:59 PM', type: 'out' },
                                          { time: '1:19:36 PM', type: 'out' },
                                          { time: 'MISSING', type: 'out', missing: true }
                                        ].map((entry, entryIdx) => (
                                          <div key={entryIdx} className="flex items-center gap-2 text-xs text-foreground">
                                            {entry.missing ? (
                                              <>
                                                <ArrowUp className="h-3.5 w-3.5 text-red-500 shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                                <span className="text-xs text-muted-foreground font-medium">{entry.time}</span>
                                              </>
                                            ) : (
                                              <>
                                                <ArrowUp className="h-3.5 w-3.5 text-orange-500 shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                                <span className="tabular-nums text-xs">{entry.time}</span>
                                              </>
                                            )}
                                          </div>
                                        ))}
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
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {attendanceRequests.map((req) => (
                  <motion.div
                    key={req.id}
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
