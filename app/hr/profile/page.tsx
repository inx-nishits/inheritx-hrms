"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { Button } from '@/components/ui/Button';
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface HRProfileData {
  // Basic/Personal details
  workCountry: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  
  // Organization/Employee identifiers
  employeeNumber: string;
  workEmail: string;
  mobileNumber: string;
  
  // Employment details
  joiningDate: string;
  jobTitle: string;
  department: string;
  location: string;
}

export default function HRProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState<HRProfileData>({
    workCountry: '',
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: user?.name || '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    employeeNumber: 'HR001',
    workEmail: user?.email || '',
    mobileNumber: '',
    joiningDate: '01 Jan 2020',
    jobTitle: 'HR Manager',
    department: user?.department || 'Human Resources',
    location: 'Bangalore',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof HRProfileData, string>>>({});
  const [lastUpdated, setLastUpdated] = useState<{ [key: string]: { by: string; date: string } }>({
    basic: { by: 'You', date: '12 Nov 2025' },
    contact: { by: 'You', date: '10 Nov 2025' },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const validateField = (field: keyof HRProfileData, value: any): string | undefined => {
    switch (field) {
      case 'workCountry':
        return !value ? 'Please select your country.' : undefined;
      case 'firstName':
        return !value ? 'Please enter your first name.' : undefined;
      case 'lastName':
        return !value ? 'Please enter your last name.' : undefined;
      case 'displayName':
        return !value ? 'Please enter a display name.' : undefined;
      case 'dateOfBirth':
        if (!value) return 'Please enter a valid DOB.';
        const dob = new Date(value);
        if (dob > new Date()) return 'Date of birth cannot be in the future.';
        return undefined;
      case 'nationality':
        return !value ? 'Please select nationality.' : undefined;
      case 'mobileNumber':
        if (!value) return 'Please enter a valid mobile number.';
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(value)) return 'Enter a valid phone number including country code.';
        return undefined;
      case 'workEmail':
        if (!value) return 'Please provide a valid company email.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please provide a valid company email.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof HRProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async (section?: string) => {
    setSaving(true);
    setSaveSuccess(false);
    
    const fieldsToValidate: (keyof HRProfileData)[] = section === 'basic' 
      ? ['workCountry', 'firstName', 'lastName', 'displayName', 'dateOfBirth', 'nationality']
      : section === 'contact'
      ? ['mobileNumber', 'workEmail']
      : [];

    let hasErrors = false;
    const newErrors: Partial<Record<keyof HRProfileData, string>> = {};
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      setSaving(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setLastUpdated(prev => ({
      ...prev,
      [section || 'general']: { by: 'You', date: formattedDate },
    }));
    
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!isAuthenticated || !user) {
    return null;
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

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your HR profile information
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Privacy:</strong> Your profile information is visible to system administrators.
          </p>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-[8px] shadow-lg z-50 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Changes saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Work Country
                  </label>
                  <InfoTooltip content="The country where you work or are located." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <NextUISelect
                  placeholder="Select country"
                  value={formData.workCountry}
                  onChange={(value) => handleChange('workCountry', value)}
                  options={['India', 'United States', 'United Kingdom', 'Canada', 'Australia']}
                  error={errors.workCountry}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    First Name
                  </label>
                  <InfoTooltip content="Enter your legal first name." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First name"
                  error={errors.firstName}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Middle Name
                  </label>
                  <InfoTooltip content="Optional — add if you use it on official docs." />
                </div>
                <Input
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  placeholder="Middle name (optional)"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Last Name
                  </label>
                  <InfoTooltip content="Enter your legal last name / family name." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last name"
                  error={errors.lastName}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Display Name
                  </label>
                  <InfoTooltip content="Name displayed to colleagues, messages and directories." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="Name shown across the product"
                  error={errors.displayName}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Gender
                  </label>
                  <InfoTooltip content="Optional. Used for HR records." />
                </div>
                <NextUISelect
                  placeholder="Select gender"
                  value={formData.gender}
                  onChange={(value) => handleChange('gender', value)}
                  options={['Male', 'Female', 'Other', 'Prefer not to say']}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Date of Birth
                  </label>
                  <InfoTooltip content="Used for benefits and identification." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  placeholder="DD MMM YYYY"
                  error={errors.dateOfBirth}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Nationality
                  </label>
                  <InfoTooltip content="Your legal nationality." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <NextUISelect
                  placeholder="Select nationality"
                  value={formData.nationality}
                  onChange={(value) => handleChange('nationality', value)}
                  options={['Indian', 'American', 'British', 'Canadian', 'Australian']}
                  error={errors.nationality}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              {lastUpdated.basic && (
                <p className="text-xs text-muted-foreground">
                  Last updated by {lastUpdated.basic.by} on {lastUpdated.basic.date}
                </p>
              )}
              <Button
                onClick={() => handleSave('basic')}
                loading={saving}
                loadingText="Saving..."
              >
                <Save className="h-4 w-4" />
                Save Basic Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organization / Employee Identifiers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
              Organization / Employee Identifiers
            </CardTitle>
            <CardDescription>
              Employee identification and organizational details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Employee Number"
                value={formData.employeeNumber}
                tooltip="Unique identifier assigned by system. Not editable."
              />
              <ReadOnlyField
                label="Job Title"
                value={formData.jobTitle}
                tooltip="Your current job title."
              />
              <ReadOnlyField
                label="Department"
                value={formData.department}
                tooltip="Your department."
              />
              <ReadOnlyField
                label="Location"
                value={formData.location}
                tooltip="Your work location."
              />
              <ReadOnlyField
                label="Joining Date"
                value={formData.joiningDate}
                tooltip="Your official joining date."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              Contact Details
            </CardTitle>
            <CardDescription>
              Your contact information for communication and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Work Email"
                value={formData.workEmail}
                tooltip="Company email. Contact IT/HR to change."
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Mobile Number
                  </label>
                  <InfoTooltip content="Used for OTPs and security. Will be verified after change." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  placeholder="+91 • Mobile number"
                  error={errors.mobileNumber}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the phone number used for OTPs and notifications. Verification required after change.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              {lastUpdated.contact && (
                <p className="text-xs text-muted-foreground">
                  Last updated by {lastUpdated.contact.by} on {lastUpdated.contact.date}
                </p>
              )}
              <Button
                onClick={() => handleSave('contact')}
                loading={saving}
                loadingText="Saving..."
              >
                <Save className="h-4 w-4" />
                Save Contact Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

