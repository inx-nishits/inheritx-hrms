"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign } from 'lucide-react';

export default function HRPayrollSalaryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Salary Structure</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage employee salary structures</p>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Salary structure management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

