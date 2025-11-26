"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  UserPlus, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { NextUISelect } from '@/components/ui/NextUISelect';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addEmployee } from '@/lib/storage';

export default function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    employeeId: '',
    workCountry: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Finance'];
  const designations = ['Developer', 'Manager', 'Executive', 'Designer', 'Analyst', 'Director'];
  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save employee to storage
    try {
      addEmployee({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || '',
        department: formData.department,
        designation: formData.designation,
        joinDate: formData.joinDate,
        employeeId: formData.employeeId || '',
        workCountry: formData.workCountry || '',
      });
      
      // Navigate to HR employees page
      router.push('/hr/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrors({ submit: 'Failed to add employee. Please try again.' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/hr/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Add New Employee</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create a new employee profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  error={errors.firstName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  error={errors.lastName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Department <span className="text-red-500">*</span>
                </label>
                <NextUISelect
                  placeholder="Select department"
                  value={formData.department}
                  onChange={(value) => handleChange('department', value)}
                  options={departments}
                  error={errors.department}
                />
                {errors.department && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.department}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Designation <span className="text-red-500">*</span>
                </label>
                <NextUISelect
                  placeholder="Select designation"
                  value={formData.designation}
                  onChange={(value) => handleChange('designation', value)}
                  options={designations}
                  error={errors.designation}
                />
                {errors.designation && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.designation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Join Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                  error={errors.joinDate}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Employee ID
                </label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Work Country
                </label>
                <NextUISelect
                  placeholder="Select country"
                  value={formData.workCountry}
                  onChange={(value) => handleChange('workCountry', value)}
                  options={countries}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Employee
              </Button>
              <Link href="/hr/employees" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

