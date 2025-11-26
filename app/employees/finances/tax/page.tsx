"use client";

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FileText, Edit } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency } from '@/lib/utils';

export default function FinancesTaxPage() {
  const taxInfo = {
    pan: 'ABCDE1234F',
    taxSlab: '30%',
    ytdTax: 15000,
    projectedTax: 18000,
    investments: [
      { section: '80C', amount: 150000, limit: 150000 },
      { section: '80D', amount: 25000, limit: 25000 },
      { section: '80G', amount: 10000, limit: 50000 },
    ],
  };

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Tax</h1>
          <p className="text-muted-foreground mt-1">View and manage your tax information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Tax Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PAN Number</span>
                <span className="font-medium">{taxInfo.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Slab</span>
                <Badge>{taxInfo.taxSlab}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YTD Tax Paid</span>
                <span className="font-medium">{formatCurrency(taxInfo.ytdTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected Tax</span>
                <span className="font-medium">{formatCurrency(taxInfo.projectedTax)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Investment Declarations</h3>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              {taxInfo.investments.map((investment, index) => (
                <div key={investment.section} className="p-3 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">Section {investment.section}</span>
                    <Badge variant="secondary">
                      {formatCurrency(investment.amount)} / {formatCurrency(investment.limit)}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(investment.amount / investment.limit) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

