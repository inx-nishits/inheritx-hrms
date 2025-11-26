"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { 
  Laptop, Home, Clock, FileText, Info, Calendar, 
  CheckCircle2, AlertCircle,
  TrendingUp, User, Users, Gift, MapPin, ArrowRight,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { holidays, employeesOnLeaveToday, employeesWorkingRemotely } from '@/lib/mockData';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState('lastWeek');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showStatsInfo, setShowStatsInfo] = useState(false);
  const [showAllHolidays, setShowAllHolidays] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const attendanceStats = {
    me: {
      lastWeek: { avgHours: '8h 1m', onTime: '100%', totalHours: '40:09', workingDays: 5 },
      lastMonth: { avgHours: '8h 15m', onTime: '95%', totalHours: '165:30', workingDays: 20 },
      custom: { avgHours: '8h 5m', onTime: '98%', totalHours: '80:25', workingDays: 10 }
    },
    myTeam: {
      lastWeek: { avgHours: '8h 16m', onTime: '100%', totalHours: '158:20', workingDays: 20 },
      lastMonth: { avgHours: '8h 10m', onTime: '94%', totalHours: '652:00', workingDays: 80 },
      custom: { avgHours: '8h 0m', onTime: '93%', totalHours: '320:00', workingDays: 40 }
    }
  };

  const getCurrentStats = () => {
    if (selectedRange === 'custom' && customDateRange.start && customDateRange.end) {
      return attendanceStats.me.custom;
    }
    return attendanceStats.me[selectedRange as keyof typeof attendanceStats.me];
  };

  const getCurrentTeamStats = () => {
    if (selectedRange === 'custom' && customDateRange.start && customDateRange.end) {
      return attendanceStats.myTeam.custom;
    }
    return attendanceStats.myTeam[selectedRange as keyof typeof attendanceStats.myTeam];
  };

  const currentStats = getCurrentStats();
  const currentTeamStats = getCurrentTeamStats();


  const handleRangeChange = (value: string) => {
    if (value === 'custom') {
      setSelectedRange('custom');
    } else {
      setSelectedRange(value === 'lastWeek' ? 'lastWeek' : 'lastMonth');
    }
  };

  // Get upcoming holidays
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingHolidays = holidays
    .filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(currentTime)}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground tabular-nums">{formatTime(currentTime)}</div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Time</p>
        </div>
      </div>

      {/* Attendance Stats and Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        {/* Compact Attendance Stats - Moved to Left */}
        <Card className="border border-border/60 shadow-sm lg:col-span-2 flex flex-col h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Attendance Stats</CardTitle>
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
                    className="w-auto min-w-[180px]"
                  />
                ) : (
                  <NextUISelect
                    placeholder="Select range"
                    value={selectedRange}
                    onChange={(value) => {
                      if (value === 'custom') {
                        setSelectedRange('custom');
                      } else {
                        handleRangeChange(value);
                      }
                    }}
                    options={[
                      { value: 'lastWeek', label: 'Last Week' },
                      { value: 'lastMonth', label: 'Last Month' },
                      { value: 'custom', label: 'Custom Range' }
                    ]}
                    classNames={{
                      base: "w-auto min-w-[120px]",
                      trigger: "h-9",
                    }}
                  />
                )}
                <button
                  onClick={() => setShowStatsInfo(true)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex-1">
            <div className="space-y-1">
              {/* Column Headers */}
              <div className="grid grid-cols-3 gap-4 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <div></div>
                <div>AVG HRS / DAY</div>
                <div>ON TIME ARRIVAL</div>
              </div>
              
              {/* My Attendance Stats */}
              <div className="grid grid-cols-3 gap-4 px-3 py-2.5 bg-yellow-50/50 dark:bg-yellow-950/10 hover:bg-yellow-100/70 dark:hover:bg-yellow-950/20 rounded-[8px] transition-colors border border-yellow-100/50 dark:border-yellow-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">My Attendance</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">{currentStats.avgHours}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">{currentStats.onTime}</span>
                </div>
              </div>

              {/* My Team Stats - For Comparison */}
              <div className="grid grid-cols-3 gap-4 px-3 py-2.5 bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100/70 dark:hover:bg-blue-950/20 rounded-[8px] transition-colors border border-blue-100/50 dark:border-blue-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">My Team (Avg)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">{currentTeamStats.avgHours}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">{currentTeamStats.onTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions - Moved to Right */}
        <Card className="border border-border/60 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full p-3 bg-gradient-to-br from-primary via-primary to-primary/90 text-white rounded-[8px] transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2.5">
                  <div className="p-1.5 bg-foreground/10 rounded-[8px] group-hover:bg-foreground/20 transition-colors">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold">Remote Clock-In</div>
                    <div className="text-xs text-white/80">Start session</div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full p-3 bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/30 border border-blue-200/60 dark:border-blue-800/40 rounded-[8px] transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-500/10 dark:bg-blue-400/20 rounded-[8px]">
                    <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Work From Home</div>
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Request WFH</div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full p-3 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30 border border-amber-200/60 dark:border-amber-800/40 rounded-[8px] transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 dark:bg-amber-400/20 rounded-[8px]">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">Partial Day</div>
                    <div className="text-xs text-amber-600/70 dark:text-amber-400/70">Request partial</div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPolicyModal(true)}
                className="group w-full p-3 bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-950/40 dark:to-slate-900/30 border border-slate-200/60 dark:border-slate-800/40 rounded-[8px] transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-foreground/10 rounded-[8px]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-foreground">Policy</div>
                    <div className="text-xs text-muted-foreground">View details</div>
                  </div>
                </div>
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Holidays */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary flex-shrink-0" />
                Upcoming Holidays
              </CardTitle>
              <button
                onClick={() => setShowAllHolidays(true)}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {upcomingHolidays
                .slice(0, 5)
                .map((holiday) => {
                  const holidayDate = new Date(holiday.date);
                  return (
                    <motion.div
                      key={holiday.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{holiday.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {holidayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="info" className="text-[9px] px-1.5 py-0 h-4">
                          {holiday.type}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              {upcomingHolidays.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No upcoming holidays
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* On Leave Today */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              On Leave Today
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {employeesOnLeaveToday.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No one on leave today
                </div>
              ) : (
                employeesOnLeaveToday.map((employee) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-2.5 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                  >
                    <Avatar name={employee.employeeName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{employee.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">
                      {employee.leaveType}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Working Remotely */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              Working Remotely
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {employeesWorkingRemotely.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No one working remotely
                </div>
              ) : (
                employeesWorkingRemotely.map((employee) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-2.5 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                  >
                    <Avatar name={employee.employeeName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{employee.employeeName}</p>
                        <Badge 
                          variant={employee.status === 'Active' ? 'success' : 'warning'} 
                          className="text-[8px] px-1 py-0 h-3"
                        >
                          {employee.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{employee.location}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/employees/attendance">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/25 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Attendance</p>
                    <p className="text-xs text-muted-foreground">View logs & requests</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employees/leave">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/25 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Leave Management</p>
                    <p className="text-xs text-muted-foreground">Request & view leaves</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employees/finances/summary">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-500/25 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Finances</p>
                    <p className="text-xs text-muted-foreground">View payslips & tax</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employees/profile">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/25 rounded-lg">
                    <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">My Profile</p>
                    <p className="text-xs text-muted-foreground">Update information</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Compact Leave Link */}
      <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Manage Your Leaves</h3>
              <p className="text-xs text-muted-foreground mt-0.5">View balances, request leaves, and check history</p>
            </div>
            <Link href="/employees/leave">
              <Button size="sm" className="shadow-sm">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Go to Leave
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} title="Attendance Policy" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Attendance policy details will be displayed here.
          </p>
        </div>
      </Modal>

      <Modal isOpen={showStatsInfo} onClose={() => setShowStatsInfo(false)} title="Attendance Statistics" size="md">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">From 03 Nov 2025 to 09 Nov 2025</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Effective Hours:</span>
                <span className="text-sm font-bold">40:09</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Working Days:</span>
                <span className="text-sm font-bold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Average Effective Hours:</span>
                <span className="text-sm font-bold">8h 1m</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* All Holidays Modal */}
      <Modal isOpen={showAllHolidays} onClose={() => setShowAllHolidays(false)} title="All Upcoming Holidays" size="lg">
        <div className="space-y-4">
          {upcomingHolidays.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No upcoming holidays</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {upcomingHolidays.map((holiday, index) => {
                const holidayDate = new Date(holiday.date);
                const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isToday = daysUntil === 0;
                const isTomorrow = daysUntil === 1;
                
                return (
                  <motion.div
                    key={holiday.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-foreground">{holiday.name}</h3>
                          <Badge 
                            variant={
                              holiday.type === 'National' ? 'default' :
                              holiday.type === 'Company' ? 'info' :
                              holiday.type === 'Religious' ? 'warning' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {holiday.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {holidayDate.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                        {(isToday || isTomorrow || daysUntil > 1) && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-primary">
                              {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `In ${daysUntil} days`}
                            </span>
                          </div>
                        )}
                        {holiday.isRecurring && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
