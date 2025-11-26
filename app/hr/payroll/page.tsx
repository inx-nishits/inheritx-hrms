"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { 
  IndianRupee, 
  Search, 
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NextUISelect } from '@/components/ui/NextUISelect';
import Link from 'next/link';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency } from '@/lib/utils';

export default function HRPayrollPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('november-2025');

  // Mock payroll data - HR sees all employees' payroll
  const payrollRecords = [
    { id: '1', employee: 'John Doe', department: 'Engineering', designation: 'Senior Developer', grossSalary: 12000, deductions: 2000, netSalary: 10000, status: 'processed', period: 'November 2025' },
    { id: '2', employee: 'Jane Smith', department: 'Marketing', designation: 'Marketing Manager', grossSalary: 15000, deductions: 2500, netSalary: 12500, status: 'processed', period: 'November 2025' },
    { id: '3', employee: 'Mike Johnson', department: 'Sales', designation: 'Sales Executive', grossSalary: 10000, deductions: 1500, netSalary: 8500, status: 'pending', period: 'November 2025' },
    { id: '4', employee: 'Sarah Williams', department: 'HR', designation: 'HR Manager', grossSalary: 14000, deductions: 2200, netSalary: 11800, status: 'processed', period: 'November 2025' },
    { id: '5', employee: 'David Lee', department: 'Engineering', designation: 'Junior Developer', grossSalary: 8000, deductions: 1200, netSalary: 6800, status: 'processed', period: 'November 2025' },
  ];

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design'];
  const statuses = ['All Status', 'Processed', 'Pending', 'Failed'];
  const periods = ['November 2025', 'October 2025', 'September 2025', 'August 2025'];

  const stats = {
    totalEmployees: 245,
    processed: 240,
    pending: 5,
    totalGrossSalary: 2450000,
    totalDeductions: 400000,
    totalNetSalary: 2050000,
  };

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || record.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payroll Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage employee payroll and salary processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/hr/payroll/process">
            <Button>
              <IndianRupee className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/25 rounded-lg">
                <IndianRupee className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200/50 dark:border-green-500/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Processed</p>
                <p className="text-2xl font-bold text-foreground">{stats.processed}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-500/25 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/50 dark:border-amber-500/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/25 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Gross Salary</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.totalGrossSalary)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Deductions</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.totalDeductions)}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Net Salary</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.totalNetSalary)}
                </p>
              </div>
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
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
                value: status === 'All Status' ? 'all' : status.toLowerCase(),
                label: status
              }))}
            />
            <NextUISelect
              label="Period"
              placeholder="Select period"
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={periods}
            />
            <Button variant="outline" className="h-11">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Payroll Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 rounded-[8px] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border border-border/40">
              <div className="col-span-3">EMPLOYEE</div>
              <div className="col-span-2">GROSS SALARY</div>
              <div className="col-span-2">DEDUCTIONS</div>
              <div className="col-span-2">NET SALARY</div>
              <div className="col-span-2">PERIOD</div>
              <div className="col-span-1">STATUS</div>
            </div>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <IndianRupee className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No payroll records found</p>
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
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(record.grossSalary)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">
                      {formatCurrency(record.deductions)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(record.netSalary)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-foreground">{record.period}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge 
                      variant={
                        record.status === 'processed' ? 'success' : 
                        record.status === 'pending' ? 'warning' : 'danger'
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

