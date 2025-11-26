// Leave Storage Utility
// Manages leave requests in localStorage

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectedReason?: string;
}

const STORAGE_KEY = 'hrms_leaves';

// Initialize with default leave requests if storage is empty
const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'L001',
    employeeId: '1',
    employeeName: 'John Doe',
    employeeEmail: 'john.doe@inheritx.com',
    leaveType: 'Casual Leave',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: 3,
    reason: 'Personal work',
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  },
];

export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === 'undefined') {
    return DEFAULT_LEAVES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    setLeaveRequests(DEFAULT_LEAVES);
    return DEFAULT_LEAVES;
  } catch (error) {
    console.error('Error reading leaves from storage:', error);
    return DEFAULT_LEAVES;
  }
}

export function setLeaveRequests(leaves: LeaveRequest[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
  } catch (error) {
    console.error('Error saving leaves to storage:', error);
  }
}

export function addLeaveRequest(leave: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>): LeaveRequest {
  const leaves = getLeaveRequests();
  
  const maxId = leaves.reduce((max, lv) => {
    const numId = parseInt(lv.id.replace('L', '')) || 0;
    return numId > max ? numId : max;
  }, 0);
  
  const newLeave: LeaveRequest = {
    ...leave,
    id: `L${String(maxId + 1).padStart(3, '0')}`,
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };

  leaves.push(newLeave);
  setLeaveRequests(leaves);
  
  return newLeave;
}

export function updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): LeaveRequest | null {
  const leaves = getLeaveRequests();
  const index = leaves.findIndex(lv => lv.id === id);
  
  if (index === -1) {
    return null;
  }

  leaves[index] = { ...leaves[index], ...updates };
  setLeaveRequests(leaves);
  
  return leaves[index];
}

export function approveLeaveRequest(id: string, approvedBy: string): LeaveRequest | null {
  return updateLeaveRequest(id, {
    status: 'Approved',
    approvedBy,
    approvedOn: new Date().toISOString().split('T')[0],
  });
}

export function rejectLeaveRequest(id: string, rejectedReason: string): LeaveRequest | null {
  return updateLeaveRequest(id, {
    status: 'Rejected',
    rejectedReason,
  });
}

export function deleteLeaveRequest(id: string): boolean {
  const leaves = getLeaveRequests();
  const filtered = leaves.filter(lv => lv.id !== id);
  
  if (filtered.length === leaves.length) {
    return false;
  }

  setLeaveRequests(filtered);
  return true;
}

export function getLeaveByEmployeeId(employeeId: string): LeaveRequest[] {
  const leaves = getLeaveRequests();
  return leaves.filter(lv => lv.employeeId === employeeId);
}

export function getPendingLeaves(): LeaveRequest[] {
  const leaves = getLeaveRequests();
  return leaves.filter(lv => lv.status === 'Pending');
}

export function getLeaveById(id: string): LeaveRequest | null {
  const leaves = getLeaveRequests();
  return leaves.find(lv => lv.id === id) || null;
}

