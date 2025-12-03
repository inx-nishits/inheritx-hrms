"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  CheckCircle2,
  Lock,
  Building,
  Shield,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';

// API Response interfaces
interface Permission {
  id: string;
  code: string;
  description: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
}

interface Role {
  id: string;
  organizationId: string;
  roleName: string;
  description: string;
  createdAt: string;
  permissions: RolePermission[];
}

interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  role: Role;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  address: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  designationId: string;
  managerId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  hireDate: string;
  employmentType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileData {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  roles: UserRole[];
  employee: Employee;
}

export default function HRProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Profile page useEffect triggered');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching profile for user ID:', user.id);

      try {
        setLoading(true);
        setError(null);
        const response = await api.getProfile(user.id);
        console.log('Profile API response:', response);
        setProfileData(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router, user?.id]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                View your HR profile information
              </p>
            </div>
          </div>
          <ErrorState
            title="Failed to Load Profile"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (!profileData) {
    return (
      <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                View your HR profile information
              </p>
            </div>
          </div>
          <ErrorState
            title="No Profile Data"
            message="Unable to load profile information."
            onRetry={() => window.location.reload()}
          />
        </div>
      </ProtectedRoute>
    );
  }

  const ReadOnlyField = ({ 
    label, 
    value, 
    tooltip
  }: { 
    label: string; 
    value: string; 
    tooltip: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      <div className="relative">
        <Input
          value={value}
          disabled
          className="bg-muted/50 cursor-not-allowed"
        />
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">
        {tooltip}
      </p>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              View your HR profile information
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${profileData.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Status:</strong> {profileData.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Basic / Personal Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary flex-shrink-0" />
              Basic / Personal Details
            </CardTitle>
            <CardDescription>
              Your personal information and identification details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="First Name"
                value={profileData.employee.firstName}
                tooltip="Your legal first name"
              />
              <ReadOnlyField
                label="Last Name"
                value={profileData.employee.lastName}
                tooltip="Your legal last name"
              />
              <ReadOnlyField
                label="Email"
                value={profileData.email}
                tooltip="Your work email address"
              />
              <ReadOnlyField
                label="Employee Code"
                value={profileData.employee.employeeCode}
                tooltip="Your unique employee identifier"
              />
              <ReadOnlyField
                label="Gender"
                value={profileData.employee.gender}
                tooltip="Your gender information"
              />
              <ReadOnlyField
                label="Date of Birth"
                value={formatDate(profileData.employee.dob)}
                tooltip="Your date of birth"
              />
              <ReadOnlyField
                label="Employment Type"
                value={profileData.employee.employmentType.replace('_', ' ').toUpperCase()}
                tooltip="Your employment type"
              />
              <ReadOnlyField
                label="Employee Status"
                value={profileData.employee.status.charAt(0).toUpperCase() + profileData.employee.status.slice(1)}
                tooltip="Your current employment status"
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary flex-shrink-0" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Your organization and employment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Organization Name"
                value={profileData.organization.name}
                tooltip="Your organization name"
              />
              <ReadOnlyField
                label="Organization Domain"
                value={profileData.organization.domain}
                tooltip="Your organization domain"
              />
              <ReadOnlyField
                label="Organization Address"
                value={profileData.organization.address}
                tooltip="Your organization address"
              />
              <ReadOnlyField
                label="Organization Contact"
                value={profileData.organization.contactEmail}
                tooltip="Organization contact email"
              />
              <ReadOnlyField
                label="Hire Date"
                value={formatDate(profileData.employee.hireDate)}
                tooltip="Your official joining date"
              />
              <ReadOnlyField
                label="Last Login"
                value={formatDate(profileData.lastLoginAt)}
                tooltip="Your last login timestamp"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles and Permissions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              Roles and Permissions
            </CardTitle>
            <CardDescription>
              Your assigned roles and associated permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.roles.map((userRole, index) => (
              <div key={userRole.roleId} className="border border-border/50 rounded-[8px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{userRole.role.roleName}</h4>
                  <span className="text-xs text-muted-foreground">
                    Assigned: {formatDate(userRole.assignedAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{userRole.role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {userRole.role.permissions.map((perm) => (
                    <span
                      key={perm.permission.id}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-[4px] font-medium"
                    >
                      {perm.permission.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              Account Information
            </CardTitle>
            <CardDescription>
              Account creation and update timestamps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Account Created"
                value={formatDate(profileData.createdAt)}
                tooltip="When your account was created"
              />
              <ReadOnlyField
                label="Last Updated"
                value={formatDate(profileData.updatedAt)}
                tooltip="When your account was last updated"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
