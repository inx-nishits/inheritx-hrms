"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserPlus, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DatePicker } from '@/components/ui/DatePicker';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RoleOption {
  id: string;
  roleName: string;
  status?: 'active' | 'inactive';
}

interface DepartmentOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface DesignationOption {
  id: string;
  title: string;
  [key: string]: any;
}

export default function AddEmployeePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    dob: '',
    employeeId: '',
    workCountry: '',
    role: 'Employee',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [selectedDesignationId, setSelectedDesignationId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  // Fetch roles from API and restrict to Employee / HR
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.getRoles();
        let rolesData: RoleOption[] = [];

        if (Array.isArray(response)) {
          rolesData = response as RoleOption[];
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) {
            rolesData = response.data;
          } else if (Array.isArray(response.roles)) {
            rolesData = response.roles;
          } else if (Array.isArray(response.items)) {
            rolesData = response.items;
          } else if (response.data && Array.isArray(response.data.data)) {
            rolesData = response.data.data;
          }
        }

        if (!Array.isArray(rolesData)) {
          rolesData = [];
        }

        // Filter to only Employee / HR type roles (by name)
        const normalized = (name?: string) => (name || '').toLowerCase().trim();
        const filtered = rolesData.filter((role) => {
          const n = normalized(role.roleName);
          // Match Employee and HR Manager roles (case-insensitive)
          return n === 'employee' || n === 'hr manager' || n === 'hr';
        });

        setRoles(filtered);

        // Default selection: Employee if available, else first role
        const employeeRole = filtered.find((r) => {
          const n = normalized(r.roleName);
          return n === 'employee' || n === 'emp';
        });

        if (employeeRole) {
          setSelectedRoleId(employeeRole.id);
          setFormData((prev) => ({ ...prev, role: employeeRole.roleName }));
        } else if (filtered[0]) {
          setSelectedRoleId(filtered[0].id);
          setFormData((prev) => ({ ...prev, role: filtered[0].roleName }));
        }
      } catch (error) {
        console.error('Failed to fetch roles for employee creation:', error);
        // We keep the local default roles (Employee) in formData.role,
        // but without a roleId the API might fail; surface a toast.
        showError('Failed to load roles. Role selection may not work correctly.');
      }
    };

    fetchRoles();
    // Intentionally run once on mount; toast handler identity is stable enough for this usage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.getDepartments({ page: 1, limit: 100 });
        let departmentsData: DepartmentOption[] = [];

        console.log('Departments API raw response:', response);

        // Departments API returns {data: {data: [...], meta: {...}}} or {data: [...], meta: {...}}
        if (response && typeof response === 'object') {
          // Handle nested structure: response.data.data
          if (response.data && Array.isArray(response.data.data)) {
            departmentsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            departmentsData = response.data;
          } else if (Array.isArray(response)) {
            // Fallback: if response is directly an array
            departmentsData = response as DepartmentOption[];
          } else if (Array.isArray(response.departments)) {
            departmentsData = response.departments;
          }
        }

        if (!Array.isArray(departmentsData)) {
          console.warn('Departments response is not an array:', response);
          departmentsData = [];
        }

        console.log('Fetched departments:', departmentsData);
        setDepartments(departmentsData);
        
        // Extract organizationId from first department if available
        if (departmentsData.length > 0 && departmentsData[0].organizationId) {
          setOrganizationId(departmentsData[0].organizationId);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        showError('Failed to load departments. Please try again.');
        setDepartments([]);
      }
    };

    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch designations from API
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await api.getDesignations({ page: 1, limit: 100 });
        let designationsData: DesignationOption[] = [];

        console.log('Designations API raw response:', response);

        // Designations API returns {data: {data: [...], meta: {...}}} or {data: [...], meta: {...}}
        if (response && typeof response === 'object') {
          // Handle nested structure: response.data.data (as shown in API response)
          if (response.data && Array.isArray(response.data.data)) {
            designationsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            designationsData = response.data;
          } else if (Array.isArray(response)) {
            // Fallback: if response is directly an array
            designationsData = response as DesignationOption[];
          } else if (Array.isArray(response.designations)) {
            designationsData = response.designations;
          }
        }

        if (!Array.isArray(designationsData)) {
          console.warn('Designations response is not an array:', response);
          designationsData = [];
        }

        console.log('Fetched designations:', designationsData);
        setDesignations(designationsData);
        
        // Extract organizationId from first designation if available (takes precedence over department)
        if (designationsData.length > 0 && designationsData[0].organizationId) {
          setOrganizationId(designationsData[0].organizationId);
        }
      } catch (error) {
        console.error('Failed to fetch designations:', error);
        showError('Failed to load designations. Please try again.');
        setDesignations([]);
      }
    };

    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!formData.password) newErrors.password = 'Password is required';
    if (!selectedDepartmentId) newErrors.department = 'Department is required';
    if (!selectedDesignationId) newErrors.designation = 'Designation is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!selectedRoleId) newErrors.role = 'Role is required';
    if (!organizationId) newErrors.organizationId = 'Organization ID is missing';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      // Format DOB as ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
      // DatePicker returns YYYY-MM-DD, so we append T00:00:00.000Z for ISO 8601
      const formattedDob = formData.dob ? `${formData.dob}T00:00:00.000Z` : '';

      const computedEmployeeCode = formData.employeeId?.trim()
        ? formData.employeeId.trim()
        : Math.floor(1000 + Math.random() * 9000).toString();

      const employeePayload: any = {
        userId: user?.id || '',
        organizationId: organizationId || '',
        departmentId: selectedDepartmentId || '',
        designationId: selectedDesignationId || '',
        employeeCode: computedEmployeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dob: formattedDob,
        hireDate: formData.joinDate,
        employmentType: 'full_time',
        status: 'active',
        roleId: selectedRoleId,
        password: formData.password,
      };

      // Only include managerId if it's provided (remove it if empty to avoid validation errors)
      // managerId can be added later when manager selection is implemented

      await api.createEmployee(employeePayload);

      success('Employee has been added successfully');

      // Navigate after a short delay so toast is visible
      setTimeout(() => {
        router.push('/hr/employees');
      }, 800);
    } catch (error) {
      console.error('Error creating employee via API:', error);
      showError('Something went wrong in server, Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} onClose={removeToast} />
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
                  value={selectedDepartmentId || ''}
                  onChange={(value) => {
                    setSelectedDepartmentId(value);
                    const selectedDept = departments.find((d) => d.id === value);
                    if (selectedDept) {
                      handleChange('department', selectedDept.name);
                    } else {
                      handleChange('department', '');
                    }
                  }}
                  options={departments.map((dept) => ({
                    label: dept.name || 'Unknown',
                    value: dept.id,
                  }))}
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
                  value={selectedDesignationId || ''}
                  onChange={(value) => {
                    setSelectedDesignationId(value);
                    const selectedDesig = designations.find((d) => d.id === value);
                    if (selectedDesig) {
                      handleChange('designation', selectedDesig.title);
                    } else {
                      handleChange('designation', '');
                    }
                  }}
                  options={designations.map((desig) => ({
                    label: desig.title || 'Unknown',
                    value: desig.id,
                  }))}
                  error={errors.designation}
                />
                {errors.designation && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.designation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.dob}
                  onChange={(value) => handleChange('dob', value)}
                  placeholder="Select date of birth"
                  error={errors.dob}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Join Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.joinDate}
                  onChange={(value) => handleChange('joinDate', value)}
                  placeholder="Select join date"
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
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Role
                </label>
                <NextUISelect
                  placeholder="Select role"
                  value={selectedRoleId || ''}
                  onChange={(value) => {
                    setSelectedRoleId(value);
                    const selectedRole = roles.find((r) => r.id === value);
                    if (selectedRole) {
                      handleChange('role', selectedRole.roleName);
                    }
                  }}
                  options={roles.map((role) => ({
                    label: role.roleName,
                    value: role.id,
                  }))}
                  error={errors.role}
                />
                {errors.role && (
                  <p className="text-sm font-medium text-red-500 mt-1">{errors.role}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  error={errors.password}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button type="submit" className="flex-1" loading={isSubmitting} loadingText="Saving...">
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

