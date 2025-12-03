"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getEmployees, StoredEmployee } from '@/lib/storage';

export default function HREmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [employees, setEmployees] = useState<StoredEmployee[]>([]);

  // Load employees from storage
  useEffect(() => {
    const loadEmployees = () => {
      setEmployees(getEmployees());
    };
    
    loadEmployees();
    
    // Refresh when page becomes visible (e.g., when navigating back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEmployees();
      }
    };
    
    // Refresh on focus
    const handleFocus = () => {
      loadEmployees();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Finance'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    
    return matchesSearch && matchesDept;
  });

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Employee Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and view all employees</p>
        </div>
        <Link href="/hr/employees/add">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200/50 dark:border-green-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="text-2xl font-bold text-foreground">{employees.filter(e => e.status === 'active').length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-500/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200/50 dark:border-purple-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Departments</p>
                <p className="text-2xl font-bold text-foreground">{new Set(employees.map(e => e.department)).size}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/50 dark:border-amber-500/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">New This Month</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept === 'All Departments' ? 'all' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar
                    src={employee.avatar}
                    alt={employee.name}
                    fallback={employee.name.split(' ').map(n => n[0]).join('')}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{employee.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{employee.designation}</span>
                    </div>
                  </div>
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        Joined {new Date(employee.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}

