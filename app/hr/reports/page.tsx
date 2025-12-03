"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  IndianRupee,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export default function HRReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report', icon: Clock },
    { value: 'leave', label: 'Leave Report', icon: Calendar },
    { value: 'payroll', label: 'Payroll Report', icon: IndianRupee },
    { value: 'employee', label: 'Employee Report', icon: Users },
  ];

  const periods = ['Last Week', 'Last Month', 'Last Quarter', 'Last Year', 'Custom'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Generate and view comprehensive HR reports</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Type Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Select Report Type</h2>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReportType(type.value)}
                  className={`p-4 border rounded-[8px] transition-all text-left ${
                    selectedReportType === type.value
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/60 hover:border-primary/40 hover:bg-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedReportType === type.value
                        ? 'bg-primary/20'
                        : 'bg-muted/50'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        selectedReportType === type.value
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`text-sm font-semibold ${
                      selectedReportType === type.value
                        ? 'text-primary'
                        : 'text-foreground'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Report Filters</h2>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-4">
          <div className="space-y-4">
            {/* First Row - Period Selection */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-auto md:min-w-[200px] flex-shrink-0">
                <NextUISelect
                  label="Period"
                  placeholder="Select period"
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  options={periods}
                />
              </div>
              {selectedPeriod === 'custom' && (
                <div className="flex-1 min-w-0 w-full">
                  <label className="block text-sm font-semibold mb-2">Custom Date Range</label>
                  <div className="w-full">
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Second Row - Generate Button */}
            <div>
              <Button variant="outline" className="h-11 w-full md:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Report Preview
        </h2>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-4 bg-muted/30 rounded-[8px] border border-border/40">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">245</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-[8px] border border-border/40">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Average Attendance</p>
                <p className="text-2xl font-bold text-foreground">94.5%</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-[8px] border border-border/40">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Leaves</p>
                <p className="text-2xl font-bold text-foreground">156</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-[8px] border border-border/40">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground">₹2.05M</p>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="p-8 bg-muted/20 rounded-[8px] border border-border/40 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Report visualization will appear here</p>
              <p className="text-xs text-muted-foreground mt-1">Generate a report to view detailed analytics</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

