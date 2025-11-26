"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export default function HRAttendanceReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Attendance Reports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Generate and view attendance reports</p>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Attendance reports coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

