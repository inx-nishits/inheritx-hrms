"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  Calendar, 
  Search, 
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function HRLeavePendingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Mock leave requests
  const leaveRequests = [
    { 
      id: '1', 
      employee: 'John Doe', 
      department: 'Engineering', 
      type: 'Sick Leave', 
      startDate: '2025-11-15', 
      endDate: '2025-11-16', 
      days: 2, 
      reason: 'Feeling unwell, need to rest',
      requestedOn: '2025-11-11',
      status: 'pending'
    },
    { 
      id: '2', 
      employee: 'Jane Smith', 
      department: 'Marketing', 
      type: 'Casual Leave', 
      startDate: '2025-11-18', 
      endDate: '2025-11-18', 
      days: 1, 
      reason: 'Personal work',
      requestedOn: '2025-11-10',
      status: 'pending'
    },
    { 
      id: '3', 
      employee: 'Mike Johnson', 
      department: 'Sales', 
      type: 'Emergency Leave!', 
      startDate: '2025-11-12', 
      endDate: '2025-11-12', 
      days: 0.5, 
      reason: 'Family emergency',
      requestedOn: '2025-11-11',
      status: 'pending'
    },
    { 
      id: '4', 
      employee: 'Sarah Williams', 
      department: 'HR', 
      type: 'Casual Leave', 
      startDate: '2025-11-20', 
      endDate: '2025-11-22', 
      days: 3, 
      reason: 'Vacation with family',
      requestedOn: '2025-11-09',
      status: 'pending'
    },
  ];

  const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design'];
  const leaveTypes = ['All Types', 'Casual Leave', 'Emergency Leave!', 'Sick Leave', 'Annual Leave', 'Unpaid Leave'];

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || req.department === selectedDepartment;
    const matchesType = selectedLeaveType === 'all' || req.type === selectedLeaveType;
    return matchesSearch && matchesDept && matchesType;
  });

  const handleAction = (request: any, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    // Handle approve/reject logic here
    setShowActionModal(false);
    setSelectedRequest(null);
    setActionType(null);
  };

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Leave Requests</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Review and approve leave requests from employees</p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1">
          {filteredRequests.length} Pending
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <NextUISelect
              label="Department"
              placeholder="Select department"
              value={selectedDepartment === 'all' ? '' : selectedDepartment}
              onChange={(value) => setSelectedDepartment(value || 'all')}
              options={departments.map(dept => ({
                value: dept === 'All Departments' ? 'all' : dept,
                label: dept
              }))}
            />
            <NextUISelect
              label="Leave Type"
              placeholder="Select leave type"
              value={selectedLeaveType === 'all' ? '' : selectedLeaveType}
              onChange={(value) => setSelectedLeaveType(value || 'all')}
              options={leaveTypes.map(type => ({
                value: type === 'All Types' ? 'all' : type,
                label: type
              }))}
            />
            <Button variant="outline" className="h-11">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Leave Requests ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No pending leave requests</p>
              </div>
            ) : (
              filteredRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 border border-border/40 rounded-[8px] hover:bg-accent/30 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar name={request.employee} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {request.employee}
                          </h3>
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4">
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{request.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isMounted
                                ? `${new Date(request.startDate).toLocaleDateString('en-US')} - ${new Date(request.endDate).toLocaleDateString('en-US')}`
                                : `${new Date(request.startDate).toISOString().split('T')[0]} - ${new Date(request.endDate).toISOString().split('T')[0]}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{request.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{request.days} {request.days === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-muted/30 rounded-[6px]">
                          <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                          <p className="text-xs text-foreground">{request.reason}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Requested on {
                            isMounted
                              ? new Date(request.requestedOn).toLocaleDateString('en-US')
                              : new Date(request.requestedOn).toISOString().split('T')[0]
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, 'approve')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, 'reject')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Modal 
        isOpen={showActionModal} 
        onClose={() => {
          setShowActionModal(false);
          setSelectedRequest(null);
          setActionType(null);
        }} 
        title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-[8px]">
              <p className="text-sm text-muted-foreground mb-1">Employee:</p>
              <p className="text-sm font-semibold text-foreground">{selectedRequest.employee}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-[8px]">
              <p className="text-sm text-muted-foreground mb-1">Leave Details:</p>
              <p className="text-sm text-foreground">
                {selectedRequest.type} - {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isMounted
                  ? `${new Date(selectedRequest.startDate).toLocaleDateString('en-US')} to ${new Date(selectedRequest.endDate).toLocaleDateString('en-US')}`
                  : `${new Date(selectedRequest.startDate).toISOString().split('T')[0]} to ${new Date(selectedRequest.endDate).toISOString().split('T')[0]}`
                }
              </p>
            </div>
            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Rejection Reason</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </ProtectedRoute>
  );
}

