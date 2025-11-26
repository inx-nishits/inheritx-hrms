"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { 
  Calendar, 
  Users, 
  Home, 
  Clock, 
  MapPin, 
  Search,
  ChevronRight,
  CalendarDays,
  UserCheck,
  Wifi,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  holidays, 
  employeesOnLeaveToday, 
  employeesWorkingRemotely,
  type Holiday,
  type EmployeeOnLeave,
  type EmployeeWorkingRemotely
} from '@/lib/mockData';

export default function OnDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get days until holiday
  const getDaysUntil = (dateString: string) => {
    const holidayDate = new Date(dateString);
    holidayDate.setHours(0, 0, 0, 0);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter and sort holidays
  const filteredHolidays = useMemo(() => {
    let filtered = [...holidays];

    // Filter by date
    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(h => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
      });
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(h => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate < today;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return selectedFilter === 'past' ? dateB - dateA : dateA - dateB;
    });

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedFilter, searchQuery]);

  // Filter employees on leave
  const filteredOnLeave = useMemo(() => {
    let filtered = [...employeesOnLeaveToday];

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [departmentFilter, searchQuery]);

  // Filter employees working remotely
  const filteredWorkingRemotely = useMemo(() => {
    let filtered = [...employeesWorkingRemotely];

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [departmentFilter, searchQuery]);

  // Get unique departments
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    employeesOnLeaveToday.forEach(emp => deptSet.add(emp.department));
    employeesWorkingRemotely.forEach(emp => deptSet.add(emp.department));
    return Array.from(deptSet).sort();
  }, []);

  // Statistics
  const stats = {
    totalOnLeave: employeesOnLeaveToday.length,
    totalWorkingRemotely: employeesWorkingRemotely.length,
    upcomingHolidays: holidays.filter(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    }).length,
    activeRemote: employeesWorkingRemotely.filter(emp => emp.status === 'Active').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track holidays, leaves, and remote workers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-purple-200/50 dark:border-purple-500/30 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50/80 via-purple-50/40 to-pink-50/60 dark:bg-gradient-to-br dark:from-slate-900/60 dark:via-purple-900/20 dark:to-slate-950/80">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-foreground uppercase tracking-wide mb-1 stat-card-title">On Leave Today</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalOnLeave}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-500/25 dark:border dark:border-purple-500/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
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
          <Card className="border border-blue-200/50 dark:border-blue-500/30 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/80 via-cyan-50/40 to-sky-50/60 dark:bg-gradient-to-br dark:from-slate-900/60 dark:via-blue-900/20 dark:to-slate-950/80">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-foreground uppercase tracking-wide mb-1 stat-card-title">Working Remotely</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalWorkingRemotely}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-500/25 dark:border dark:border-blue-500/30 rounded-lg">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-300" />
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
          <Card className="border border-green-200/50 dark:border-green-500/30 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-teal-50/60 dark:bg-gradient-to-br dark:from-slate-900/60 dark:via-emerald-900/20 dark:to-slate-950/80">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-foreground uppercase tracking-wide mb-1 stat-card-title">Active Remote</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeRemote}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-500/25 dark:border dark:border-green-500/30 rounded-lg">
                  <Wifi className="h-5 w-5 text-green-600 dark:text-green-300" />
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
          <Card className="border border-amber-200/50 dark:border-amber-500/30 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/60 dark:bg-gradient-to-br dark:from-slate-900/60 dark:via-amber-900/20 dark:to-slate-950/80">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-foreground uppercase tracking-wide mb-1 stat-card-title">Upcoming Holidays</p>
                  <p className="text-2xl font-bold text-foreground">{stats.upcomingHolidays}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-500/25 dark:border dark:border-amber-500/30 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Holidays Listing */}
        <Card className="border border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
                Holidays
              </CardTitle>
              <div className="flex gap-1 border border-border/60 rounded-[8px] p-0.5 bg-muted/30">
                <button
                  onClick={() => setSelectedFilter('upcoming')}
                  className={`px-2 py-1 rounded-[6px] text-xs font-semibold transition-all ${
                    selectedFilter === 'upcoming'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2 py-1 rounded-[6px] text-xs font-semibold transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('past')}
                  className={`px-2 py-1 rounded-[6px] text-xs font-semibold transition-all ${
                    selectedFilter === 'past'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredHolidays.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No holidays found
                </div>
              ) : (
                filteredHolidays.map((holiday, idx) => {
                  const daysUntil = getDaysUntil(holiday.date);
                  const holidayDate = new Date(holiday.date);
                  const isToday = holidayDate.toDateString() === today.toDateString();
                  const isPast = holidayDate < today;

                  return (
                    <motion.div
                      key={holiday.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-[8px] border transition-all ${
                        isToday
                          ? 'bg-primary/10 border-primary/30 shadow-sm'
                          : isPast
                          ? 'bg-muted/30 border-border/40'
                          : 'bg-card border-border/40 hover:bg-accent/30 hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {holiday.name}
                            </h4>
                            <Badge
                              variant={
                                holiday.type === 'National'
                                  ? 'info'
                                  : holiday.type === 'Company'
                                  ? 'success'
                                  : 'default'
                              }
                              className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0"
                            >
                              {holiday.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {formatDate(holiday.date)}
                          </p>
                          {!isPast && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {isToday ? (
                                <span className="text-primary font-semibold">Today</span>
                              ) : daysUntil === 1 ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                  Tomorrow
                                </span>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" />
                                  <span>{daysUntil} days away</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* On Leave Today */}
        <Card className="border border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                On Leave Today
              </CardTitle>
              <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                {filteredOnLeave.length}
              </Badge>
            </div>
            {departments.length > 0 && (
              <div className="mt-2">
                <NextUISelect
                  placeholder="Department"
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map(dept => ({ value: dept, label: dept }))
                  ]}
                  classNames={{
                    base: "w-auto min-w-[180px]",
                    trigger: "h-9",
                  }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredOnLeave.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No employees on leave today</p>
                </div>
              ) : (
                filteredOnLeave.map((employee, idx) => {
                  const startDate = new Date(employee.startDate);
                  const endDate = new Date(employee.endDate);
                  const isMultiDay = employee.days > 1;

                  return (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-[8px] border border-border/40 bg-purple-50/50 dark:bg-purple-950/10 hover:bg-purple-100/70 dark:hover:bg-purple-950/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={employee.employeeName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {employee.employeeName}
                            </h4>
                            <Badge
                              variant={
                                employee.leaveType === 'Sick Leave'
                                  ? 'danger'
                                  : employee.leaveType === 'Annual Leave'
                                  ? 'info'
                                  : 'warning'
                              }
                              className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0"
                            >
                              {employee.leaveType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {employee.department}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isMultiDay
                                ? `${formatDate(employee.startDate)} - ${formatDate(employee.endDate)}`
                                : formatDate(employee.startDate)}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span>{employee.days} {employee.days === 1 ? 'day' : 'days'}</span>
                          </div>
                          {employee.reason && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic">
                              "{employee.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Working Remotely */}
        <Card className="border border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                Working Remotely
              </CardTitle>
              <Badge variant="info" className="text-[10px] px-2 py-0.5">
                {filteredWorkingRemotely.length}
              </Badge>
            </div>
            {departments.length > 0 && (
              <div className="mt-2">
                <NextUISelect
                  placeholder="Department"
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map(dept => ({ value: dept, label: dept }))
                  ]}
                  classNames={{
                    base: "w-auto min-w-[180px]",
                    trigger: "h-9",
                  }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredWorkingRemotely.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Home className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No employees working remotely</p>
                </div>
              ) : (
                filteredWorkingRemotely.map((employee, idx) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-[8px] border transition-all ${
                      employee.status === 'Active'
                        ? 'border-blue-200/60 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100/70 dark:hover:bg-blue-950/20'
                        : 'border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100/70 dark:hover:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar name={employee.employeeName} size="sm" />
                        {employee.status === 'Active' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {employee.employeeName}
                          </h4>
                          <Badge
                            variant={employee.status === 'Active' ? 'success' : 'warning'}
                            className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0"
                          >
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {employee.designation}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          {employee.department}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{employee.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{employee.checkInTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

