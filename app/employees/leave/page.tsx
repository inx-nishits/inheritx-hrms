"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { 
  Calendar, Plus, Download, Check, X, Clock, Eye, 
  Search, MoreVertical, Info, TrendingUp, Coffee
} from 'lucide-react';
import { motion } from 'framer-motion';
import { leaveTypes } from '@/lib/mockData';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { filterDataByRole } from '@/lib/auth';

export default function LeavePage() {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEncashmentModal, setShowEncashmentModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showCompOffHistory, setShowCompOffHistory] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState('All Types');
  const [selectedYear, setSelectedYear] = useState('Jan 2025 - Dec 2025');
  const [activePolicyTab, setActivePolicyTab] = useState('Birthday Leave');

  // Mock data
  const leaveBalances = [
    { type: 'Casual Leave', available: 2, consumed: 10.5, accrued: 8, carryover: 2, annual: 8, color: '#EF4444' },
    { type: 'Emergency Leave!', available: 0.5, consumed: 1.5, accrued: 2, carryover: 0, annual: 2, color: '#10B981' },
    { type: 'Sick Leave', available: 1, consumed: 3, accrued: 4, carryover: 0, annual: 4, color: '#F59E0B' },
    { type: 'Unpaid Leave', available: Infinity, consumed: 2, accrued: Infinity, carryover: 0, annual: Infinity, color: '#FBBF24' },
    { type: 'Annual Leave', available: 15, consumed: 5, accrued: 20, carryover: 0, annual: 20, color: '#3B82F6' },
  ];

  const pendingLeaveRequests: any[] = [];

  // Mock leave history - In real app, filter by user.id
  // For now, showing sample data for the current employee
  const leaveHistory = [
    { dates: '30 Oct 2025, 1 Day', type: 'Sick Leave', status: 'Approved by Meera Tank', requestedBy: 'You', actionOn: '03 Nov 2025', note: "I'm not feeling well today and have a fever, so I'll be taking the day off.", reason: '' },
    { dates: '24 Oct 2025, 1 Day', type: 'Unpaid Leave', status: 'Approved by Attendance Penalisation Policy', requestedBy: 'System', actionOn: '27 Oct 2025', note: 'Leave deducted as no attendance logged for 24-10-2025', reason: '' },
    { dates: '03 Oct 2025, 1 Day', type: 'Casual Leave', status: 'Cancelled by You', requestedBy: 'You', actionOn: '17 Sep 2025', note: 'I would like to request 1 day leave for the Mundan (Babri) ceremony...', reason: 'Due to change in plan (October - No leave month)' },
    { dates: '26 Sept 2025, 1 Day', type: 'Casual Leave', status: 'Approved by Aiyub Munshi', requestedBy: 'You', actionOn: '11 Sep 2025', note: 'I would like to request leave as I am planning a trip with friends.', reason: '' },
  ];

  const compensatoryOffHistory = [
    { requestDate: '07 Jan 2025', days: 0.5, leaveType: 'Casual Leave', requestedOn: '08 Jan 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'Worked 4 hour due to project emergency' },
    { requestDate: '16 Feb 2025', days: 1, leaveType: 'Casual Leave', requestedOn: '19 Feb 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'worked on LIMS PDF report.- Approved from Ri...' },
    { requestDate: '01 Mar 2025', days: 1, leaveType: 'Casual Leave', requestedOn: '03 Apr 2025', note: 'Awarded by Meera Tank', status: 'Approved by Meera Tank', reason: 'Leave credited Against working on Saturday du...' },
  ];

  const filteredHistory = leaveHistory.filter(leave => {
    if (selectedStatus !== 'All' && !leave.status.toLowerCase().includes(selectedStatus.toLowerCase())) return false;
    if (selectedLeaveType !== 'All Types' && leave.type !== selectedLeaveType) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Leave Management</h1>
            <p className="text-muted-foreground">Manage leave requests, balances, and history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowApplyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <CardTitle className="text-xl font-bold">Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {pendingLeaveRequests.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-semibold mb-2">Hurray! No pending leave requests</p>
                <p className="text-sm text-muted-foreground">Request leave on the right!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingLeaveRequests.map((req) => (
                  <div key={req.id} className="p-4 border-2 border-border rounded-lg">
                    {/* Leave request item */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year Selector and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <NextUISelect
            placeholder="Select year"
            value={selectedYear}
            onChange={setSelectedYear}
            options={['Jan 2026 - Dec 2026', 'Jan 2025 - Dec 2025', 'Jan 2024 - Dec 2024']}
            classNames={{
              base: "w-[200px]",
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowEncashmentModal(true)}>
              Request Leave Encashment
            </Button>
            <Button variant="outline" onClick={() => setShowCompOffHistory(true)}>
              Compensatory Off Requests History
            </Button>
            <Button variant="outline" onClick={() => setShowPolicyModal(true)}>
              Leave Policy Explanation
            </Button>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {leaveBalances.map((leave, idx) => {
            const percentage = leave.available === Infinity ? 100 : (leave.available / leave.annual) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold">{leave.type}</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-2">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-muted/20"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke={leave.color}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                              className="transition-all duration-500"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold" style={{ color: leave.color }}>
                              {leave.available === Infinity ? '∞' : leave.available}
                            </span>
                            <span className="text-xs text-muted-foreground">Days Available</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-semibold">{leave.available === Infinity ? '∞' : leave.available}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Consumed:</span>
                          <span className="font-semibold">{leave.consumed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accrued So Far:</span>
                          <span className="font-semibold">{leave.accrued === Infinity ? '∞' : leave.accrued}</span>
                        </div>
                        {leave.carryover > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Carryover:</span>
                            <span className="font-semibold">{leave.carryover}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Quota:</span>
                          <span className="font-semibold">{leave.annual === Infinity ? '∞' : leave.annual}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Other Leave Types */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Other Leave Types Available:</span> Birthday Leave, Marriage Anniversary Leave
            </p>
          </CardContent>
        </Card>

        {/* Leave History */}
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Leave History</CardTitle>
              <div className="flex items-center gap-2">
                <NextUISelect
                  placeholder="Leave Type"
                  value={selectedLeaveType}
                  onChange={setSelectedLeaveType}
                  options={['All Types', 'Casual Leave', 'Emergency Leave!', 'Sick Leave', 'Annual Leave', 'Unpaid Leave']}
                  classNames={{
                    base: "w-[150px]",
                  }}
                />
                <NextUISelect
                  placeholder="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={['All Status', 'Approved', 'Pending', 'Rejected', 'Cancelled']}
                  classNames={{
                    base: "w-[150px]",
                  }}
                />
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="text" placeholder="Search..." className="pl-8 w-[200px]" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg font-semibold text-sm border border-border">
                <div className="col-span-2">LEAVE DATES</div>
                <div className="col-span-2">LEAVE TYPE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">REQUESTED BY</div>
                <div className="col-span-2">ACTION TAKEN ON</div>
                <div className="col-span-2">LEAVE NOTE</div>
              </div>
              {filteredHistory.map((leave, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-4 border-2 border-border rounded-lg hover:bg-accent/50 hover:border-primary/30 transition-all"
                >
                  <div className="col-span-2">
                    <span className="text-sm font-medium">{leave.dates}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{leave.type}</span>
                    <p className="text-xs text-muted-foreground">Requested on {leave.actionOn}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={leave.status.includes('Approved') ? 'success' : leave.status.includes('Cancelled') ? 'danger' : 'warning'}>
                      {leave.status}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{leave.requestedBy}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{leave.actionOn}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground line-clamp-2">{leave.note}</span>
                    {leave.reason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {leave.reason}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Request Leave" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                placeholder="Select leave type"
                value=""
                onChange={() => {}}
                options={leaveTypes}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" required />
              <Input label="End Date" type="date" required />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Days: <span className="font-bold text-foreground">3</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Reason</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
                placeholder="Enter reason for leave..."
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Submit Application</Button>
              <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showEncashmentModal} onClose={() => setShowEncashmentModal(false)} title="Request Leave Encashment" size="md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Select available leave type for encashment <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                placeholder="Select leave type"
                value=""
                onChange={() => {}}
                options={['Casual Leave', 'Sick Leave', 'Annual Leave']}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">How many leaves do you want to encash?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="quantity" value="all" defaultChecked className="w-4 h-4" />
                  <span>All</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="quantity" value="custom" className="w-4 h-4" />
                  <Input type="number" placeholder="Enter number" className="flex-1" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Note</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter note..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEncashmentModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Request</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showCompOffHistory} onClose={() => setShowCompOffHistory(false)} title="Compensatory Off Requests History" size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <NextUISelect
                placeholder="Status"
                value="All Status"
                onChange={() => {}}
                options={['All Status', 'Approved', 'Pending', 'Rejected']}
                classNames={{
                  base: "w-[150px]",
                }}
              />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Search..." className="pl-8 w-[200px]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg font-semibold text-sm border border-border">
                <div className="col-span-2">REQUEST DATES</div>
                <div className="col-span-2">LEAVE TYPE</div>
                <div className="col-span-2">NOTE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-3">REASON</div>
                <div className="col-span-1">ACTIONS</div>
              </div>
              {compensatoryOffHistory.map((comp, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 border-2 border-border rounded-lg hover:bg-accent/50 transition-all">
                  <div className="col-span-2">
                    <span className="text-sm font-medium">{comp.requestDate}</span>
                    <p className="text-xs text-muted-foreground">No. of Days - {comp.days}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{comp.leaveType}</span>
                    <p className="text-xs text-muted-foreground">Requested on {comp.requestedOn}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">{comp.note}</span>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="success">{comp.status}</Badge>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-muted-foreground">{comp.reason}</span>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Total: {compensatoryOffHistory.length}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>1 to {compensatoryOffHistory.length} of {compensatoryOffHistory.length}</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} title="Leave Policy Explanation" size="xl">
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
              {['Birthday Leave', 'Casual Leave', 'Emergency Leave!', 'Marriage Anniversary Leave', 'Sick Leave', 'Annual Leave', 'Unpaid Leave'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActivePolicyTab(type)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activePolicyTab === type
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{activePolicyTab}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activePolicyTab === 'Birthday Leave' 
                  ? "Birthday leave is a paid time off to observe an event, such as employee's birthday."
                  : "Leave policy details for " + activePolicyTab}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0.5</div>
                    <div className="text-xs text-muted-foreground">Days Available</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-sm">Consumed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

