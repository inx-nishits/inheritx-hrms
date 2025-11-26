"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Settings, 
  Save,
  Building,
  Calendar,
  IndianRupee,
  Clock
} from 'lucide-react';
import { NextUISelect } from '@/components/ui/NextUISelect';

export default function HRSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'leave', label: 'Leave Policies', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: IndianRupee },
    { id: 'attendance', label: 'Attendance', icon: Clock },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure system settings and policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <Card className="border border-border/60 shadow-sm lg:col-span-1">
          <CardContent className="pt-6">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border border-border/60 shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Company Name
                  </label>
                  <Input placeholder="Enter company name" defaultValue="InheritX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Time Zone
                  </label>
                  <NextUISelect
                    placeholder="Select timezone"
                    value="utc"
                    onChange={() => {}}
                    options={[
                      { value: 'utc', label: 'UTC' },
                      { value: 'est', label: 'Eastern Time' },
                      { value: 'pst', label: 'Pacific Time' },
                      { value: 'ist', label: 'Indian Standard Time' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Date Format
                  </label>
                  <NextUISelect
                    placeholder="Select date format"
                    value="mm-dd-yyyy"
                    onChange={() => {}}
                    options={[
                      { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
                      { value: 'dd-mm-yyyy', label: 'DD/MM/YYYY' },
                      { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }
                    ]}
                  />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Organization Name
                  </label>
                  <Input placeholder="Enter organization name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Industry
                  </label>
                  <NextUISelect
                    placeholder="Select industry"
                    value=""
                    onChange={() => {}}
                    options={[
                      { value: 'tech', label: 'Technology' },
                      { value: 'finance', label: 'Finance' },
                      { value: 'healthcare', label: 'Healthcare' },
                      { value: 'retail', label: 'Retail' }
                    ]}
                  />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}

            {activeTab === 'leave' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Leave policy settings will be displayed here.</p>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Payroll settings will be displayed here.</p>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Attendance settings will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

