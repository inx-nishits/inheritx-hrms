"use client";

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency } from '@/lib/utils';

export default function FinancesPayPage() {
  const payslip = {
    month: 'October 2024',
    employee: 'Sarah Johnson',
    employeeId: 'E001',
    earnings: {
      basic: 7916.67,
      hra: 2000,
      transport: 500,
      other: 1000,
      total: 11416.67,
    },
    deductions: {
      tax: 1500,
      pf: 1000,
      insurance: 500,
      other: 250,
      total: 3250,
    },
    netPay: 8166.67,
  };

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Pay</h1>
          <p className="text-muted-foreground mt-1">View and download your payslips</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Payslip - {payslip.month}</h2>
              <p className="text-sm text-muted-foreground mt-1">{payslip.employee} ({payslip.employeeId})</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Payslip
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(payslip.earnings.basic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HRA</span>
                  <span className="font-medium">{formatCurrency(payslip.earnings.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport Allowance</span>
                  <span className="font-medium">{formatCurrency(payslip.earnings.transport)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Allowances</span>
                  <span className="font-medium">{formatCurrency(payslip.earnings.other)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total Earnings</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payslip.earnings.total)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Deductions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Income Tax</span>
                  <span className="font-medium">{formatCurrency(payslip.deductions.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provident Fund</span>
                  <span className="font-medium">{formatCurrency(payslip.deductions.pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="font-medium">{formatCurrency(payslip.deductions.insurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Deductions</span>
                  <span className="font-medium">{formatCurrency(payslip.deductions.other)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total Deductions</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(payslip.deductions.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Net Pay</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(payslip.netPay)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

