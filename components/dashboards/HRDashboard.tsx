"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { 
  Users, 
  Calendar, 
  Clock, 
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileText,
  BarChart3,
  CalendarDays,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { holidays } from '@/lib/mockData';

export default function HRDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  // Mock data
  const stats = {
    totalEmployees: 245,
    onLeaveToday: 12,
    pendingLeaveRequests: 8,
    attendanceRate: 94.5,
    payrollProcessed: 240,
    activeRecruitments: 5,
  };

  const recentLeaveRequests = [
    { id: '1', employee: 'John Doe', department: 'Engineering', type: 'Sick Leave', days: 2, status: 'pending', requestedOn: '2025-11-11' },
    { id: '2', employee: 'Jane Smith', department: 'Marketing', type: 'Casual Leave', days: 1, status: 'pending', requestedOn: '2025-11-10' },
    { id: '3', employee: 'Mike Johnson', department: 'Sales', type: 'Emergency Leave', days: 0.5, status: 'pending', requestedOn: '2025-11-10' },
    { id: '4', employee: 'Sarah Williams', department: 'HR', type: 'Casual Leave', days: 3, status: 'pending', requestedOn: '2025-11-09' },
  ];

  const attendanceAlerts = [
    { id: '1', employee: 'Tom Brown', department: 'Engineering', issue: 'Late arrival', date: '2025-11-11' },
    { id: '2', employee: 'Lisa Anderson', department: 'Design', issue: 'Missing punch', date: '2025-11-10' },
    { id: '3', employee: 'David Lee', department: 'Engineering', issue: 'Early departure', date: '2025-11-10' },
  ];

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Finance'];

  const quickActions = [
    { name: 'Add Employee', icon: UserPlus, href: '/hr/employees/add', color: 'blue' },
    { name: 'Process Payroll', icon: IndianRupee, href: '/hr/payroll/process', color: 'green' },
    { name: 'View Reports', icon: BarChart3, href: '/hr/reports', color: 'indigo' },
    { name: 'Manage Policies', icon: FileText, href: '/hr/settings', color: 'amber' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'HR Manager'}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(currentTime)}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground tabular-nums">{formatTime(currentTime)}</div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Time</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Employees</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-500/25 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">On Leave Today</p>
                  <p className="text-2xl font-bold text-foreground">{stats.onLeaveToday}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-500/25 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingLeaveRequests}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-500/25 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.attendanceRate}%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-500/25 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payroll Processed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.payrollProcessed}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/25 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Recruitments</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeRecruitments}</p>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/25 rounded-lg">
                  <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/25' :
                        action.color === 'green' ? 'bg-green-100 dark:bg-green-500/25' :
                        action.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-500/25' :
                        'bg-amber-100 dark:bg-amber-500/25'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          action.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                          action.color === 'green' ? 'text-green-600 dark:text-green-300' :
                          action.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-300' :
                          'text-amber-600 dark:text-amber-300'
                        }`} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{action.name}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Leave Requests */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                Pending Leave Requests
              </CardTitle>
              <Link href="/hr/leave/pending">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentLeaveRequests.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pending leave requests
                </div>
              ) : (
                recentLeaveRequests.map((request, idx) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar name={request.employee} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {request.employee}
                            </h4>
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {request.department}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{request.type}</span>
                            <span>•</span>
                            <span>{request.days} {request.days === 1 ? 'day' : 'days'}</span>
                            <span>•</span>
                            <span>{new Date(request.requestedOn).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Alerts */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                Attendance Alerts
              </CardTitle>
              <Link href="/hr/attendance">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {attendanceAlerts.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No attendance alerts
                </div>
              ) : (
                attendanceAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10 rounded-[8px] hover:bg-amber-100/70 dark:hover:bg-amber-950/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-500/25 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {alert.employee}
                          </h4>
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">
                            Alert
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {alert.department}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-amber-700 dark:text-amber-300">{alert.issue}</span>
                          <span>•</span>
                          <span>{new Date(alert.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Holidays */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary flex-shrink-0" />
                Upcoming Holidays
              </CardTitle>
              <Link href="/hr/holidays">
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {holidays
                .filter((holiday) => {
                  const holidayDate = new Date(holiday.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  holidayDate.setHours(0, 0, 0, 0);
                  return holidayDate >= today;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((holiday, idx) => {
                  const holidayDate = new Date(holiday.date);
                  const daysUntil = Math.ceil((holidayDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                  return (
                    <motion.div
                      key={holiday.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{holiday.name}</p>
                            <Badge 
                              variant={
                                holiday.type === 'National' ? 'default' :
                                holiday.type === 'Company' ? 'info' :
                                holiday.type === 'Religious' ? 'warning' : 'secondary'
                              }
                              className="text-[9px] px-1.5 py-0 h-4"
                            >
                              {holiday.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {holidayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {daysUntil >= 0 && (
                            <p className="text-xs text-primary font-medium mt-1">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              {holidays.filter((h) => {
                const d = new Date(h.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                d.setHours(0, 0, 0, 0);
                return d >= today;
              }).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No upcoming holidays
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

