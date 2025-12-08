"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu, Moon, Search, Sun, User, LogOut, KeyRound, PanelLeftClose, PanelLeftOpen, Mail, Phone, Building, Briefcase, Calendar, MapPin, IndianRupee, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from '../ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { leaveRequests, payrollRecords, type Employee } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { getEmployees, StoredEmployee } from '@/lib/storage';
import { ChangePasswordModal } from '../ui/ChangePasswordModal';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, onSidebarToggle, sidebarCollapsed = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    employees: StoredEmployee[];
    leaves: typeof leaveRequests;
    payroll: typeof payrollRecords;
  }>({ employees: [], leaves: [], payroll: [] });
  const [selectedEmployee, setSelectedEmployee] = useState<StoredEmployee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const notifications = [
    { id: 1, title: 'Leave request approved', time: '2 hours ago', unread: true },
    { id: 2, title: 'Payslip generated for October', time: '1 day ago', unread: true },
    { id: 3, title: 'Performance review scheduled', time: '2 days ago', unread: false },
  ];

  // Search functionality - Role-based filtering
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Get employees from storage
      const allEmployees = getEmployees();
      
      // Search employees - HR sees all, employees see only themselves
      const matchedEmployees = allEmployees.filter(emp => {
        const matchesQuery = emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.designation.toLowerCase().includes(query) ||
          emp.id.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query);
        
        // HR can see all matching employees, employees only see themselves
        if (user?.role.includes('hr')) {
          return matchesQuery;
        } else if (user?.role.includes('employee')) {
          // Employees can see themselves if they match
          return matchesQuery && emp.email === user.email;
        }
        return false;
      });

      // Search leave requests - HR sees all, employees see only their own
      const matchedLeaves = leaveRequests.filter(leave => {
        const matchesQuery = leave.employeeName.toLowerCase().includes(query) ||
          leave.leaveType.toLowerCase().includes(query) ||
          leave.reason.toLowerCase().includes(query);
        
        // HR can see all matching leaves, employees only see their own
        if (user?.role.includes('hr')) {
          return matchesQuery;
        } else if (user?.role.includes('employee')) {
          return matchesQuery && leave.employeeId === user.id;
        }
        return false;
      });

      // Search payroll records - HR sees all, employees see only their own
      const matchedPayroll = payrollRecords.filter(payroll => {
        const matchesQuery = payroll.employeeName.toLowerCase().includes(query) ||
          payroll.payPeriod.toLowerCase().includes(query);
        
        // HR can see all matching payroll, employees only see their own
        if (user?.role.includes('hr')) {
          return matchesQuery;
        } else if (user?.role.includes('employee')) {
          return matchesQuery && payroll.employeeId === user.id;
        }
        return false;
      });

      setSearchResults({
        employees: matchedEmployees,
        leaves: matchedLeaves,
        payroll: matchedPayroll,
      });
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults({ employees: [], leaves: [], payroll: [] });
    }
  }, [searchQuery, user]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSearchResults]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationsRef.current && 
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  const handleSearchResultClick = (type: 'employee' | 'leave' | 'payroll', id: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    // Navigate based on type
    if (type === 'employee') {
      // Find the employee in current search results and show modal
      const employee = searchResults.employees.find(emp => emp.id === id);
      if (employee) {
        // Security check: Employees can only view their own details
        if (user?.role.includes('employee') && employee.id !== user.id) {
          // Employee trying to view another employee - redirect to own profile
          router.push('/employees/profile');
          return;
        }
        // HR can view any employee, employees can view their own
        setSelectedEmployee(employee);
        setShowEmployeeModal(true);
      }
    } else if (type === 'leave') {
      if (user?.role.includes('employee')) {
        router.push('/employees/leave');
      } else {
        router.push('/hr/leave/pending');
      }
    } else if (type === 'payroll') {
      if (user?.role.includes('employee')) {
        router.push('/employees/finances/pay');
      } else {
        router.push('/hr/payroll');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border h-16 compact:h-14 flex items-center justify-between transition-theme">
      {/* Left Section - Logo and Mobile Menu Button */}
      <div className="flex items-center gap-3 ml-5 lg:ml-6">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onSidebarToggle}
          className="hidden lg:flex p-2 compact:p-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-2 compact:p-1.5">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">InheritX HRMS</span>
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 compact:p-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Search Bar - Aligned to content left side (after sidebar) */}
      <div className={`hidden sm:flex items-center flex-1 max-w-lg lg:pl-8 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        <div ref={searchRef} className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <input
            type="text"
            placeholder={user?.role.includes('hr') ? "Search employees, leaves, payroll..." : "Search my leaves, payroll..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            className="w-full pl-10 pr-4 py-2 compact:py-1.5 border border-input rounded-lg bg-background text-sm font-medium focus:outline-none focus:border-primary transition-all hover:border-primary/30"
          />
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (searchResults.employees.length > 0 || searchResults.leaves.length > 0 || searchResults.payroll.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg z-50 shadow-lg max-h-96 overflow-y-auto mx-4"
              >
                {/* Employees Results - Only show for HR, employees should not see other employees */}
                {searchResults.employees.length > 0 && user?.role.includes('hr') && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Employees ({searchResults.employees.length})
                    </div>
                    {searchResults.employees.slice(0, 5).map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleSearchResultClick('employee', emp.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                      >
                        <Avatar name={emp.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.designation} • {emp.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Employees Results - For employees, only show themselves */}
                {searchResults.employees.length > 0 && user?.role.includes('employee') && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      My Profile
                    </div>
                    {searchResults.employees.slice(0, 1).map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleSearchResultClick('employee', emp.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                      >
                        <Avatar name={emp.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.designation} • {emp.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Leave Results - Show employee name only for HR */}
                {searchResults.leaves.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Leave Requests ({searchResults.leaves.length})
                    </div>
                    {searchResults.leaves.slice(0, 5).map((leave) => (
                      <button
                        key={leave.id}
                        onClick={() => handleSearchResultClick('leave', leave.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {user?.role.includes('hr') ? leave.employeeName : 'My Leave Request'}
                        </p>
                        <p className="text-xs text-muted-foreground">{leave.leaveType} • {leave.startDate} to {leave.endDate}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Payroll Results - Hide salary amounts for employees, show only period */}
                {searchResults.payroll.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Payroll ({searchResults.payroll.length})
                    </div>
                    {searchResults.payroll.slice(0, 5).map((payroll) => (
                      <button
                        key={payroll.id}
                        onClick={() => handleSearchResultClick('payroll', payroll.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {user?.role.includes('hr') ? payroll.employeeName : 'My Payslip'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payroll.payPeriod}
                          {user?.role.includes('hr') && (
                            <> • {formatCurrency(payroll.netSalary)}</>
                          )}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 compact:gap-1 mr-5 lg:mr-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 compact:p-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 compact:p-1.5 hover:bg-accent rounded-lg transition-colors relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-card"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 bg-card border border-border rounded-lg z-20 transition-theme overflow-hidden w-[min(320px,calc(100vw-32px))] mr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="font-bold text-base">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center border-t border-border bg-muted/30">
                    <button className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 compact:p-1 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground font-medium capitalize leading-tight">
                {user?.role || 'Employee'}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 bg-card border border-border rounded-lg z-20 transition-theme overflow-hidden w-[min(208px,calc(100vw-32px))] mr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2.5">
                    <button 
                      onClick={() => {
                        console.log("user?.role", user)
                        setShowProfileMenu(false);
                        if (user?.role?.includes('hr')) {
                          router.push('/hr/profile');
                        } else {
                          router.push('/employees/profile');
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 font-semibold text-sm cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 font-semibold text-sm cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4" />
                      Change Password
                    </button>
                    <div className="border-t border-border my-2"></div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-500 flex items-center gap-3 font-semibold text-sm cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />

      {/* Employee Details Modal */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        title={selectedEmployee ? `Employee Details - ${selectedEmployee.name}` : 'Employee Details'}
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <Avatar name={selectedEmployee.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{selectedEmployee.name}</h3>
                  <Badge variant={selectedEmployee.status.toLowerCase() === 'active' ? 'success' : 'default'}>
                    {selectedEmployee.status.toLowerCase() === 'active'
                      ? 'Active'
                      : selectedEmployee.status.toLowerCase() === 'inactive'
                        ? 'Inactive'
                        : selectedEmployee.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEmployee.designation}</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.department}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Employment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Designation</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.designation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Department</p>
                    <p className="text-sm font-medium text-foreground">{selectedEmployee.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Join Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {isMounted
                        ? new Date(selectedEmployee.joinDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : new Date(selectedEmployee.joinDate).toISOString().split('T')[0]
                      }
                    </p>
                  </div>
                </div>
                {selectedEmployee.workCountry && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Work Country</p>
                      <p className="text-sm font-medium text-foreground">{selectedEmployee.workCountry}</p>
                    </div>
                  </div>
                )}
                {selectedEmployee.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                      <p className="text-sm font-medium text-foreground">{selectedEmployee.location}</p>
                    </div>
                  </div>
                )}
                {selectedEmployee.manager && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Reporting Manager</p>
                      <p className="text-sm font-medium text-foreground">{selectedEmployee.manager}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Information - Only visible to HR */}
            {user?.role.includes('hr') && selectedEmployee.salary && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Compensation</h4>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-3">
                  <IndianRupee className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Annual Salary</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(selectedEmployee.salary)}
                    </p>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-[8px] p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Confidential:</strong> Salary information is only visible to HR and authorized personnel.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {user?.role.includes('hr') && (
                <button
                  onClick={() => {
                    setShowEmployeeModal(false);
                    setSelectedEmployee(null);
                    router.push('/hr/employees');
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  View Full Profile
                </button>
              )}
              {user?.role.includes('employee') && (
                <button
                  onClick={() => {
                    setShowEmployeeModal(false);
                    setSelectedEmployee(null);
                    router.push('/employees/profile');
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  View My Full Profile
                </button>
              )}
              <button
                onClick={() => {
                  setShowEmployeeModal(false);
                  setSelectedEmployee(null);
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}
