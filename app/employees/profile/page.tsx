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
  DollarSign,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompensationSection } from '@/components/profile/CompensationSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface EmployeeProfileData {
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
  numberSeries: string;
  employeeNumber: string;
  reportingManager: string;
  
  // Contact details
  workEmail: string;
  mobileNumber: string;
  
  // Employment details
  joiningDate: string;
  jobTitle: string;
  timeType: string;
  legalEntity: string;
  businessUnit: string;
  department: string;
  location: string;
  workLocation: string;
  workerType: string;
  probationPolicy: string;
  noticePeriod: string;
  leavePlan: string;
  attendanceTracking: boolean;
  shift: string;
  weeklyOff: string;
  attendanceNumber: string;
  attendanceCaptureScheme: string;
  attendanceTrackingPolicy: string;
  overtime: string;
  expensePolicy: string;
  
  // Compensation
  enablePayroll: boolean;
  payGroup: string;
  annualSalary: string;
  salaryPeriod: 'per-annum' | 'per-month';
  salaryEffectiveFrom: string;
  regularSalary: string;
  bonus: string;
  bonusIncludedInAnnual: boolean;
  pfEligible: boolean;
  esiApplicable: boolean;
  salaryStructureType: string;
  taxRegime: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEmployee] = useState(true); // In real app, check user role
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showWorkDetails, setShowWorkDetails] = useState(false);
  
  const [formData, setFormData] = useState<EmployeeProfileData>({
    workCountry: '',
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    numberSeries: 'Default Number Series',
    employeeNumber: '5350',
    reportingManager: 'John Smith',
    workEmail: 'you@company.com',
    mobileNumber: '',
    joiningDate: '05 Nov 2025',
    jobTitle: 'AI ML (Python) Developer',
    timeType: 'Full Time',
    legalEntity: 'InheritX Technologies',
    businessUnit: 'Engineering',
    department: 'AI/ML',
    location: 'Bangalore',
    workLocation: '',
    workerType: 'Permanent',
    probationPolicy: '6 Months',
    noticePeriod: '30 Days',
    leavePlan: 'Standard Leave Plan',
    attendanceTracking: true,
    shift: 'General Shift',
    weeklyOff: 'Sunday',
    attendanceNumber: 'ATT001',
    attendanceCaptureScheme: 'Biometric',
    attendanceTrackingPolicy: 'Standard Policy',
    overtime: 'As per policy',
    expensePolicy: 'Standard Expense Policy',
    enablePayroll: true,
    payGroup: '',
    annualSalary: '',
    salaryPeriod: 'per-annum',
    salaryEffectiveFrom: '',
    regularSalary: '',
    bonus: '',
    bonusIncludedInAnnual: false,
    pfEligible: false,
    esiApplicable: false,
    salaryStructureType: '',
    taxRegime: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeProfileData, string>>>({});
  const [lastUpdated, setLastUpdated] = useState<{ [key: string]: { by: string; date: string } }>({
    basic: { by: 'HR', date: '12 Nov 2025' },
    contact: { by: 'You', date: '10 Nov 2025' },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const validateField = (field: keyof EmployeeProfileData, value: any): string | undefined => {
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
        if (!value) return 'Please provide a valid company email (name@company.com).';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please provide a valid company email (name@company.com).';
        return undefined;
      case 'payGroup':
        return !value ? 'Please select a valid Pay Group to proceed.' : undefined;
      case 'annualSalary':
        if (!value) return 'Enter annual salary amount to continue.';
        const salary = parseFloat(value);
        if (isNaN(salary) || salary <= 0) return 'Please enter a valid salary amount greater than 0.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof EmployeeProfileData, value: any) => {
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
    
    // Validate active section
    const fieldsToValidate: (keyof EmployeeProfileData)[] = section === 'basic' 
      ? ['workCountry', 'firstName', 'lastName', 'displayName', 'dateOfBirth', 'nationality']
      : section === 'contact'
      ? ['mobileNumber', 'workEmail']
      : section === 'compensation'
      ? ['payGroup', 'annualSalary']
      : [];

    let hasErrors = false;
    const newErrors: Partial<Record<keyof EmployeeProfileData, string>> = {};
    
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
    
    // Update last updated info
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

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your personal information and complete onboarding steps
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

        {/* Privacy Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Privacy:</strong> Visible to HR and your manager.
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
                  <InfoTooltip content="Name displayed to colleagues, messages and directories. Keep it short." />
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="Name shown across the product (e.g., John D.)"
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
              Employee identification and organizational details (managed by HR)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Number Series"
                value={formData.numberSeries}
                tooltip="Assigned by HR. Contact HR to change."
              />
              <ReadOnlyField
                label="Employee Number"
                value={formData.employeeNumber}
                tooltip="Unique identifier assigned by HR. Not editable."
              />
              <ReadOnlyField
                label="Reporting Manager"
                value={formData.reportingManager}
                tooltip="Your reporting manager. Click to request a change."
                requestChangeLink
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

        {/* Employment Details Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                  Employment Details
                </CardTitle>
                <CardDescription>
                  Job and organizational information (managed by HR)
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkDetails(!showWorkDetails)}
              >
                {showWorkDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Work & Employment Details
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showWorkDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    These fields are managed by HR. Contact HR to request changes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField
                      label="Joining Date"
                      value={formData.joiningDate}
                      tooltip="Your official joining date (set by HR). To correct this, contact HR."
                    />
                    <ReadOnlyField
                      label="Job Title"
                      value={formData.jobTitle}
                      tooltip="Assigned by HR. Request changes via Change Job request."
                      requestChangeLink
                    />
                    <ReadOnlyField
                      label="Time Type"
                      value={formData.timeType}
                      tooltip="Employment time type, set by HR."
                    />
                    <ReadOnlyField
                      label="Legal Entity"
                      value={formData.legalEntity}
                      tooltip="Managed by HR. Contact HR to request updates."
                    />
                    <ReadOnlyField
                      label="Business Unit"
                      value={formData.businessUnit}
                      tooltip="Managed by HR. Contact HR to request updates."
                    />
                    <ReadOnlyField
                      label="Department"
                      value={formData.department}
                      tooltip="Managed by HR. Contact HR to request updates."
                    />
                    <ReadOnlyField
                      label="Location"
                      value={formData.location}
                      tooltip="Managed by HR. Contact HR to request updates."
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-foreground">
                          Work Location (City)
                        </label>
                        <InfoTooltip content="Your current work location city. Editable for remote employees." />
                      </div>
                      <Input
                        value={formData.workLocation}
                        onChange={(e) => handleChange('workLocation', e.target.value)}
                        placeholder="Enter work location city"
                      />
                    </div>
                    <ReadOnlyField
                      label="Worker Type"
                      value={formData.workerType}
                      tooltip="Permanent/Contract — set by HR."
                    />
                    <ReadOnlyField
                      label="Probation Policy"
                      value={formData.probationPolicy}
                      tooltip="Your probation policy. See HR policy document for details."
                    />
                    <ReadOnlyField
                      label="Notice Period"
                      value={formData.noticePeriod}
                      tooltip="Your notice period as per contract."
                    />
                    <ReadOnlyField
                      label="Leave Plan"
                      value={formData.leavePlan}
                      tooltip="Your leave entitlement as per company policy."
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-foreground">
                          Attendance Tracking
                        </label>
                        <InfoTooltip content="Attendance tracking is enabled for your profile." />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-[8px] border border-border/50">
                        <span className="text-sm text-foreground">
                          {formData.attendanceTracking ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <ReadOnlyField
                      label="Shift"
                      value={formData.shift}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Weekly Off"
                      value={formData.weeklyOff}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Attendance Number"
                      value={formData.attendanceNumber}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Attendance Capture Scheme"
                      value={formData.attendanceCaptureScheme}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Attendance Tracking Policy"
                      value={formData.attendanceTrackingPolicy}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Overtime"
                      value={formData.overtime}
                      tooltip="Configured by HR/Operations. Contact HR for changes."
                    />
                    <ReadOnlyField
                      label="Expense Policy"
                      value={formData.expensePolicy}
                      tooltip="Expense policy assigned to you."
                    />
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Compensation Section */}
        <CompensationSection
          data={{
            enablePayroll: formData.enablePayroll,
            payGroup: formData.payGroup,
            annualSalary: formData.annualSalary,
            salaryPeriod: formData.salaryPeriod,
            salaryEffectiveFrom: formData.salaryEffectiveFrom,
            regularSalary: formData.regularSalary,
            bonus: formData.bonus,
            bonusIncludedInAnnual: formData.bonusIncludedInAnnual,
            pfEligible: formData.pfEligible,
            esiApplicable: formData.esiApplicable,
            salaryStructureType: formData.salaryStructureType,
            taxRegime: formData.taxRegime,
          }}
          onChange={(field, value) => handleChange(field as keyof EmployeeProfileData, value)}
          errors={{
            payGroup: errors.payGroup,
            annualSalary: errors.annualSalary,
            salaryStructureType: errors.salaryStructureType,
          }}
          onSave={() => handleSave('compensation')}
          saving={saving}
          isEmployee={isEmployee}
        />
      </div>
    </ProtectedRoute>
  );
}

