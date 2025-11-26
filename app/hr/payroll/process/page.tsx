"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NextUISelect } from '@/components/ui/NextUISelect';

export default function HRPayrollProcessPage() {
  const periods = ['November 2025', 'October 2025', 'September 2025'];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Link href="/hr/payroll">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Process Payroll</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Process payroll for selected period</p>
        </div>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Payroll Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Select Period
            </label>
            <NextUISelect
              placeholder="Select payroll period"
              value=""
              onChange={() => {}}
              options={periods}
            />
          </div>
          <Button className="w-full">
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

