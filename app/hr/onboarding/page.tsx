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
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { 
  holidays, 
  employeesOnLeaveToday, 
  employeesWorkingRemotely,
  type Holiday,
  type EmployeeOnLeave,
  type EmployeeWorkingRemotely
} from '@/lib/mockData';

export default function OnboardingPage() {
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

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    let filtered = [...holidays];

    // Apply date filter
    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(holiday => new Date(holiday.date) >= today);
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(holiday => new Date(holiday.date) < today);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(holiday => 
        holiday.name.toLowerCase().includes(query) ||
        holiday.type.toLowerCase().includes(query)
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered;
  }, [searchQuery, selectedFilter]);

  // Get upcoming holidays count
  const upcomingHolidaysCount = holidays.filter(h => new Date(h.date) >= today).length;

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Onboarding Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage new employee onboarding and track progress</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">New Joinings Today</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Onboarding</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed This Month</p>
                <p className="text-2xl font-bold text-foreground">28</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">87%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Onboarding Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">New Employee Checklist</h3>
                  <Badge variant="default">3 pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete onboarding tasks for new joiners
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for more onboarding content */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Onboarding Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Onboarding activities will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

