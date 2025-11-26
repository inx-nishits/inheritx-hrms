"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  Inbox as InboxIcon, 
  Bell, 
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Notification {
  id: string;
  type: 'leave' | 'attendance' | 'payroll' | 'profile' | 'system';
  title: string;
  message: string;
  date: string;
  status: 'read' | 'unread';
  priority: 'high' | 'medium' | 'low';
}

const mockNotifications: Notification[] = [
  {
    id: 'N001',
    type: 'leave',
    title: 'Leave Request Approved',
    message: 'Your casual leave request for Nov 15-16 has been approved by your manager.',
    date: '2024-11-10',
    status: 'unread',
    priority: 'medium',
  },
  {
    id: 'N002',
    type: 'payroll',
    title: 'Payslip Generated',
    message: 'Your payslip for October 2024 is now available for download.',
    date: '2024-11-05',
    status: 'unread',
    priority: 'high',
  },
  {
    id: 'N003',
    type: 'attendance',
    title: 'Attendance Regularized',
    message: 'Your attendance for Nov 8 has been regularized by HR.',
    date: '2024-11-09',
    status: 'read',
    priority: 'low',
  },
  {
    id: 'N004',
    type: 'system',
    title: 'Profile Update Required',
    message: 'Please update your emergency contact information in your profile.',
    date: '2024-11-07',
    status: 'read',
    priority: 'medium',
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'leave':
      return Calendar;
    case 'attendance':
      return Clock;
    case 'payroll':
      return FileText;
    case 'profile':
      return FileText;
    case 'system':
      return Bell;
    default:
      return FileText;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'leave':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'attendance':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'payroll':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'profile':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'system':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function EmployeeInboxPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archive'>('all');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, status: 'read' as const } : notif
    ));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return notif.status === 'unread';
    if (activeTab === 'archive') return notif.status === 'read';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
            <p className="text-muted-foreground mt-1">Your notifications and updates</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'all' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'unread' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            UNREAD
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                {unreadCount}
              </Badge>
            )}
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

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-6">
                <InboxIcon className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {activeTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
                </h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                      notification.status === 'unread' ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          {notification.status === 'unread' && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <Badge 
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

