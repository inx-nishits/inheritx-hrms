"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HRDepartmentsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Departments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage organizational departments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">Department management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

