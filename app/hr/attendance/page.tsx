"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { 
  Clock, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function HRAttendancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Mock attendance data - HR sees all employees' attendance
  const attendanceRecords = [
    { id: '1', employee: 'John Doe', department: 'Engineering', date: '2025-11-11', checkIn: '09:00', checkOut: '18:00', hours: '9h 0m', status: 'present', location: 'Office' },
    { id: '2', employee: 'Jane Smith', department: 'Marketing', date: '2025-11-11', checkIn: '09:15', checkOut: '18:30', hours: '9h 15m', status: 'present', location: 'Office' },
    { id: '3', employee: 'Mike Johnson', department: 'Sales', date: '2025-11-11', checkIn: '09:30', checkOut: '-', hours: '-', status: 'late', location: 'Office' },
    { id: '4', employee: 'Sarah Williams', department: 'HR', date: '2025-11-11', checkIn: '-', checkOut: '-', hours: '-', status: 'absent', location: '-' },
    { id: '5', employee: 'David Lee', department: 'Engineering', date: '2025-11-11', checkIn: '08:45', checkOut: '17:45', hours: '9h 0m', status: 'present', location: 'Remote' },
  ];

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design'];
  const statuses = ['All Status', 'Present', 'Absent', 'Late', 'On Leave'];

  const stats = {
    present: 195,
    absent: 12,
    late: 8,
    onLeave: 12,
    attendanceRate: 94.5,
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || record.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus.toLowerCase().replace(' ', '');
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle 
          size="lg" 
          description="Monitor and manage employee attendance"
        >
          Attendance Management
        </PageTitle>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border border-green-200/50 dark:border-green-500/30 shadow-sm">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Present</p>
                <p className="text-2xl font-bold text-foreground">{stats.present}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-500/25 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200/50 dark:border-red-500/30 shadow-sm">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Absent</p>
                <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-500/25 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/50 dark:border-amber-500/30 shadow-sm">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Late</p>
                <p className="text-2xl font-bold text-foreground">{stats.late}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/25 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200/50 dark:border-purple-500/30 shadow-sm">
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">On Leave</p>
                <p className="text-2xl font-bold text-foreground">{stats.onLeave}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-500/25 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.attendanceRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/25 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* First Row - Search and Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <NextUISelect
                label="Department"
                placeholder="Select department"
                value={selectedDepartment === 'all' ? '' : selectedDepartment}
                onChange={(value) => setSelectedDepartment(value || 'all')}
                options={departments.map(dept => ({
                  value: dept === 'All Departments' ? 'all' : dept,
                  label: dept
                }))}
              />
              <NextUISelect
                label="Status"
                placeholder="Select status"
                value={selectedStatus === 'all' ? '' : selectedStatus}
                onChange={(value) => setSelectedStatus(value || 'all')}
                options={statuses.map(status => ({
                  value: status === 'All Status' ? 'all' : status.toLowerCase().replace(' ', ''),
                  label: status
                }))}
              />
            </div>
            {/* Second Row - Date Range and Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 min-w-0 w-full">
                <label className="block text-sm font-semibold mb-2">Date Range</label>
                <div className="w-full">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-end w-full md:w-auto flex-shrink-0">
                <Button variant="outline" className="h-11 w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 rounded-[8px] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border border-border/40">
              <div className="col-span-3">EMPLOYEE</div>
              <div className="col-span-2">DATE</div>
              <div className="col-span-2">CHECK IN</div>
              <div className="col-span-2">CHECK OUT</div>
              <div className="col-span-2">HOURS</div>
              <div className="col-span-1">STATUS</div>
            </div>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              filteredRecords.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar name={record.employee} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{record.employee}</p>
                      <p className="text-xs text-muted-foreground">{record.department}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">
                      {isMounted
                        ? new Date(record.date).toLocaleDateString('en-US')
                        : new Date(record.date).toISOString().split('T')[0]
                      }
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">{record.checkIn}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">{record.checkOut}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">{record.hours}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge 
                      variant={
                        record.status === 'present' ? 'success' : 
                        record.status === 'absent' ? 'danger' : 
                        record.status === 'late' ? 'warning' : 'default'
                      } 
                      className="text-[9px] px-1.5 py-0 h-4"
                    >
                      {record.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}

