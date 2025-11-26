"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar } from 'lucide-react';

export default function HRLeaveAllPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">All Leave Requests</h1>
        <p className="text-xs text-muted-foreground mt-0.5">View all leave requests history</p>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">All leave requests view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

