"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Inbox as InboxIcon, 
  Bell, 
  Archive, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  UserCheck,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Request {
  id: string;
  type: 'leave' | 'attendance' | 'expense' | 'profile' | 'overtime' | 'shift';
  title: string;
  employee: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

const mockRequests: Request[] = [
  {
    id: 'R001',
    type: 'leave',
    title: 'Leave Request - Casual Leave',
    employee: 'Michael Chen',
    date: '2024-11-10',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'R002',
    type: 'expense',
    title: 'Expense Claim - Travel',
    employee: 'Sarah Johnson',
    date: '2024-11-09',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'R003',
    type: 'attendance',
    title: 'Attendance Regularization',
    employee: 'Emily Rodriguez',
    date: '2024-11-08',
    status: 'pending',
    priority: 'low',
  },
  {
    id: 'R004',
    type: 'profile',
    title: 'Profile Change Request',
    employee: 'James Anderson',
    date: '2024-11-07',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'R005',
    type: 'overtime',
    title: 'Overtime Request',
    employee: 'David Kim',
    date: '2024-11-06',
    status: 'pending',
    priority: 'high',
  },
];

const getRequestIcon = (type: Request['type']) => {
  switch (type) {
    case 'leave':
      return Calendar;
    case 'expense':
      return IndianRupee;
    case 'attendance':
      return Clock;
    case 'profile':
      return UserCheck;
    case 'overtime':
      return Clock;
    case 'shift':
      return Clock;
    default:
      return FileText;
  }
};

const getRequestColor = (type: Request['type']) => {
  switch (type) {
    case 'leave':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'expense':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'attendance':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'profile':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'overtime':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'shift':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function HRInboxPage() {
  const [activeTab, setActiveTab] = useState<'action' | 'notifications' | 'archive'>('action');
  const [requests, setRequests] = useState<Request[]>(mockRequests);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <ProtectedRoute allowedRoles={['hr', 'HR Manager']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
            <p className="text-muted-foreground mt-1">Manage employee requests and approvals</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('action')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'action' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            TAKE ACTION
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {pendingRequests.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'notifications' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            NOTIFICATIONS
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'archive' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ARCHIVE
          </button>
        </div>

        {/* Content */}
        {activeTab === 'action' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {pendingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-6">
                    <InboxIcon className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">All requests have been processed</p>
                  </div>
                </div>
              </Card>
            ) : (
              pendingRequests.map((request, index) => {
                const Icon = getRequestIcon(request.type);
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${getRequestColor(request.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{request.title}</h3>
                              <Badge 
                                variant={request.priority === 'high' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {request.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">{request.employee}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested on {new Date(request.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-6">
                  <Bell className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No New Notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'archive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {[...approvedRequests, ...rejectedRequests].length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Archive className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Archive Empty</h3>
                    <p className="text-muted-foreground">No archived requests yet</p>
                  </div>
                </div>
              </Card>
            ) : (
              [...approvedRequests, ...rejectedRequests].map((request, index) => {
                const Icon = getRequestIcon(request.type);
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 opacity-75">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getRequestColor(request.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{request.title}</h3>
                            <Badge 
                              variant={request.status === 'approved' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {request.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-medium">{request.employee}</span>
                          </p>
                          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                            {new Date(request.date).toLocaleDateString('en-US')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}

