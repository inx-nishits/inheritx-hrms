"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Users, 
  MapPin, 
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  location: string;
}

const mockDepartments: Department[] = [
  {
    id: 'D001',
    name: 'Engineering',
    manager: 'John Smith',
    employeeCount: 45,
    location: 'Bangalore',
  },
  {
    id: 'D002',
    name: 'Human Resources',
    manager: 'Sarah Johnson',
    employeeCount: 12,
    location: 'Mumbai',
  },
  {
    id: 'D003',
    name: 'Sales',
    manager: 'Michael Chen',
    employeeCount: 28,
    location: 'Delhi',
  },
  {
    id: 'D004',
    name: 'Marketing',
    manager: 'Emily Rodriguez',
    employeeCount: 15,
    location: 'Bangalore',
  },
];

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organization Structure</h1>
            <p className="text-muted-foreground mt-1">Manage departments, teams, and organizational hierarchy</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Departments</p>
                <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Locations</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(departments.map(d => d.location)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search departments, managers, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Departments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {dept.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Manager</span>
                    <div className="flex items-center gap-2">
                      <Avatar name={dept.manager} size="sm" />
                      <span className="text-sm font-medium text-foreground">{dept.manager}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Employees</span>
                    <Badge variant="default">{dept.employeeCount}</Badge>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4" size="sm">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Network className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Departments Found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}

