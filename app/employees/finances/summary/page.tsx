"use client";

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { Wallet, IndianRupee, TrendingUp, CreditCard } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function FinancesSummaryPage() {
  const stats = [
    { label: 'Current Salary', value: '₹95,000', icon: IndianRupee, color: 'text-green-600' },
    { label: 'YTD Earnings', value: '₹95,000', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'YTD Deductions', value: '₹8,000', icon: CreditCard, color: 'text-red-600' },
    { label: 'Net Pay YTD', value: '₹87,000', icon: Wallet, color: 'text-purple-600' },
  ];

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Finances - Summary</h1>
          <p className="text-muted-foreground mt-1">Overview of your financial information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Payslips</h2>
          <div className="space-y-3">
            {['October 2024', 'September 2024', 'August 2024'].map((month, index) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{month}</p>
                  <p className="text-sm text-muted-foreground">Net Pay: ₹7,666.67</p>
                </div>
                <Badge variant="default">Download</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

