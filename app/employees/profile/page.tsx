"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip';
import { Loading } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';
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
interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Designation {
  id: string;
  organizationId: string;
  title: string;
  level: number;
  description: string;
  createdAt: string;
}

interface Manager {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  designationId: string;
  managerId: string | null;
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

interface Contact {
  id?: string;
  employeeId?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface BankDetail {
  id?: string;
  employeeId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

interface EmployeeProfileData {
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
  user: User;
  department: Department;
  designation: Designation;
  manager: Manager;
  contact: Contact | null;
  bankDetails: BankDetail[];
  subordinates: any[];
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editableValues, setEditableValues] = useState({
    firstName: '',
    lastName: '',
    dob: '',
  });

  useEffect(() => {
    console.log('Employee profile page useEffect triggered');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      if (!user?.employeeId) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching employee profile for user ID:', user.employeeId);

      try {
        setLoading(true);
        setError(null);
        const response = await api.getEmployeeProfile(user.employeeId);
        console.log('Employee profile API response:', response);
        setProfileData(response.data); // API returns the employee object directly, not wrapped in {data: ...}
      } catch (err) {
        console.error('Failed to fetch employee profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router, user?.id]);

  useEffect(() => {
    if (profileData) {
      setEditableValues({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
      });
    }
  }, [profileData]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['employee']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['employee']}>
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                View your personal information
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
      <ProtectedRoute allowedRoles={['employee']}>
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                View your personal information
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
    tooltip, 
    requestChangeLink 
  }: { 
    label: string; 
    value: string; 
    tooltip: string;
    requestChangeLink?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <InfoTooltip content={tooltip} />
        {requestChangeLink && (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => {/* Open change request modal */}}
          >
            Request change
          </button>
        )}
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

  const handleEditableChange = (field: keyof typeof editableValues, value: string) => {
    setEditableValues(prev => ({ ...prev, [field]: value }));
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSave = async () => {
    if (!profileData?.userId) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const payload = {
        firstName: editableValues.firstName.trim(),
        lastName: editableValues.lastName.trim(),
        dob: editableValues.dob,
      };

      await api.updateProfile(profileData.userId, payload);

      setProfileData(prev => prev ? {
        ...prev,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dob: payload.dob,
      } : prev);

      setSaveSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              View your personal information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="text-xs text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // Open HR contact
              }}
            >
              Need help? Contact HR
            </a>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${profileData.status ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Status:</strong> {profileData.status ? 'Active' : 'Inactive'}
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
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                  First Name
                  <Badge variant="secondary" className="uppercase text-[10px]">Editable</Badge>
                </label>
                <Input
                  value={editableValues.firstName}
                  onChange={(e) => handleEditableChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
                <p className="text-xs text-muted-foreground">Your legal first name</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                  Last Name
                  <Badge variant="secondary" className="uppercase text-[10px]">Editable</Badge>
                </label>
                <Input
                  value={editableValues.lastName}
                  onChange={(e) => handleEditableChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
                <p className="text-xs text-muted-foreground">Your legal last name</p>
              </div>
              <div className="space-y-2">
                <ReadOnlyField
                  label="Work Email"
                  value={profileData.user?.email || 'N/A'}
                  tooltip="Your official work email (not editable)"
                />
              </div>
              <ReadOnlyField
                label="Employee Code"
                value={profileData.employeeCode || 'N/A'}
                tooltip="Your unique employee identifier"
              />
              <ReadOnlyField
                label="Gender"
                value={profileData.gender || 'N/A'}
                tooltip="Your gender information"
              />
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                  Date of Birth
                  <Badge variant="secondary" className="uppercase text-[10px]">Editable</Badge>
                </label>
                <Input
                  type="date"
                  value={editableValues.dob}
                  onChange={(e) => handleEditableChange('dob', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Your date of birth</p>
              </div>
              <ReadOnlyField
                label="Employment Type"
                value={profileData.employmentType ? profileData.employmentType.replace('_', ' ').toUpperCase() : 'N/A'}
                tooltip="Your employment type"
              />
              <ReadOnlyField
                label="Employee Status"
                value={profileData.status ? profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1) : 'N/A'}
                tooltip="Your current employment status"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
              <Button onClick={handleSave} disabled={isSaving} className="sm:w-auto w-full">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
              Employment Details
            </CardTitle>
            <CardDescription>
              Your job and organizational information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Job Title"
                value={profileData.designation?.title || 'N/A'}
                tooltip="Your current job title"
              />
              <ReadOnlyField
                label="Department"
                value={profileData.department?.name || 'N/A'}
                tooltip="Your department"
              />
              <ReadOnlyField
                label="Manager"
                value={profileData.manager ? `${profileData.manager.firstName} ${profileData.manager.lastName}` : 'N/A'}
                tooltip="Your reporting manager"
              />
              <ReadOnlyField
                label="Hire Date"
                value={profileData.hireDate ? formatDate(profileData.hireDate) : 'N/A'}
                tooltip="Your official joining date"
              />
              <ReadOnlyField
                label="Last Login"
                value={profileData.user?.lastLoginAt ? formatDate(profileData.user.lastLoginAt) : 'N/A'}
                tooltip="Your last login timestamp"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        {profileData.contact && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Your contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.contact.phone && (
                  <ReadOnlyField
                    label="Phone"
                    value={profileData.contact.phone}
                    tooltip="Your phone number"
                  />
                )}
                {profileData.contact.emergencyContact && (
                  <ReadOnlyField
                    label="Emergency Contact"
                    value={profileData.contact.emergencyContact}
                    tooltip="Emergency contact person"
                  />
                )}
                {profileData.contact.emergencyPhone && (
                  <ReadOnlyField
                    label="Emergency Phone"
                    value={profileData.contact.emergencyPhone}
                    tooltip="Emergency contact number"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                value={profileData.createdAt ? formatDate(profileData.createdAt) : 'N/A'}
                tooltip="When your account was created"
              />
              <ReadOnlyField
                label="Last Updated"
                value={profileData.updatedAt ? formatDate(profileData.updatedAt) : 'N/A'}
                tooltip="When your account was last updated"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security and password
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Update your password regularly to keep your account secure.
              </p>
            </div>
            <Button onClick={() => setShowChangePassword(true)} className="w-full md:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </ProtectedRoute>
  );
}
