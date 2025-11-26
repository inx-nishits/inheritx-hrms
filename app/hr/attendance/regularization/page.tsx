"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

export default function HRAttendanceRegularizationPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Attendance Regularization</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Review and approve attendance regularization requests</p>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">Attendance regularization coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

