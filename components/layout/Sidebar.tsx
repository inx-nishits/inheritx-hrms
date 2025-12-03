"use client";

import { cn } from '@/lib/utils';
import {
  X,
  User,
  Inbox,
  ChevronRight,
  Wallet,
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Building,
  UserCheck,
  CalendarDays,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];        // allowed roles for this menu item
  subItems?: SubMenuItem[];
}

const allMenuItems: MenuItem[] = [
  // Shared menu items
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['employee', 'hr', 'HR Manager'] },

  // Employee menu items
  { name: 'Attendance', href: '/employees/attendance', icon: Clock, roles: ['employee'] },
  { name: 'Profile', href: '/employees/profile', icon: User, roles: ['employee'] },
  { name: 'Leave', href: '/employees/leave', icon: Calendar, roles: ['employee'] },
  { name: 'Inbox', href: '/employees/inbox', icon: Inbox, roles: ['employee'] },
  {
    name: 'Finances',
    icon: Wallet,
    roles: ['employee'],
    subItems: [
      { name: 'Summary', href: '/employees/finances/summary' },
      { name: 'My Pay', href: '/employees/finances/pay' },
      { name: 'Manage Tax', href: '/employees/finances/tax' },
    ],
  },

  // HR menu items
  { name: 'Inbox', href: '/hr/inbox', icon: Inbox, roles: ['hr', 'HR Manager'] },
  { name: 'Profile', href: '/hr/profile', icon: User, roles: ['hr', 'HR Manager'] },
  { name: 'Roles Management', href: '/hr/roles', icon: Shield, roles: ['hr', 'HR Manager'] },
  {
    name: 'Employees',
    icon: Users,
    roles: ['hr', 'HR Manager'],
    subItems: [
      { name: 'All Employees', href: '/hr/employees' },
      { name: 'Add Employee', href: '/hr/employees/add' },
      { name: 'Departments', href: '/hr/departments' },
    ],
  },
  {
    name: 'Leave Management',
    icon: Calendar,
    roles: ['hr', 'HR Manager'],
    subItems: [
      { name: 'Pending Requests', href: '/hr/leave/pending' },
      { name: 'All Leaves', href: '/hr/leave/all' },
      { name: 'Leave Policies', href: '/hr/leave/policies' },
    ],
  },
  { name: 'Holidays', href: '/hr/holidays', icon: CalendarDays, roles: ['hr', 'HR Manager'] },
  {
    name: 'Attendance',
    icon: Clock,
    roles: ['hr', 'HR Manager'],
    subItems: [
      { name: 'Overview', href: '/hr/attendance' },
      { name: 'Regularization', href: '/hr/attendance/regularization' },
      { name: 'Reports', href: '/hr/attendance/reports' },
    ],
  },
  {
    name: 'Payroll',
    icon: Wallet,
    roles: ['hr', 'HR Manager'],
    subItems: [
      { name: 'Overview', href: '/hr/payroll' },
      { name: 'Process Payroll', href: '/hr/payroll/process' },
      { name: 'Salary Structure', href: '/hr/payroll/salary' },
    ],
  },
  { name: 'Onboarding', href: '/hr/onboarding', icon: UserCheck, roles: ['hr', 'HR Manager'] },
  { name: 'Organization', href: '/hr/organization', icon: Building, roles: ['hr', 'HR Manager'] },
  { name: 'Reports', href: '/hr/reports', icon: BarChart3, roles: ['hr', 'HR Manager'] },
  { name: 'Settings', href: '/hr/settings', icon: Settings, roles: ['hr', 'HR Manager'] },
];

export function Sidebar({ isOpen, onClose, collapsed = false }: SidebarProps) {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? '/';
  const { user } = useAuth();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [tooltipState, setTooltipState] = useState<{ text: string; top: number; left: number } | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-expand items that have active sub-items
  useEffect(() => {
    const expanded: string[] = [];
    allMenuItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSub = item.subItems.some(subItem => pathname === subItem.href);
        if (hasActiveSub) {
          expanded.push(item.name);
        }
      }
    });
    setExpandedItems(expanded);
  }, [pathname]);

  // Update popover position on scroll
  useEffect(() => {
    if (hoveredItem && collapsed) {
      const updatePosition = () => {
        const element = itemRefs.current[hoveredItem];
        if (element) {
          const rect = element.getBoundingClientRect();
          setPopoverPosition({
            top: rect.top,
            left: rect.left + rect.width + 8
          });
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      return () => window.removeEventListener('scroll', updatePosition, true);
    }
  }, [hoveredItem, collapsed]);

  // Update tooltip position on scroll
  useEffect(() => {
    if (tooltipState && collapsed) {
      const updateTooltipPosition = () => {
        const itemName = Object.keys(itemRefs.current).find(key => tooltipState.text === key);
        if (itemName) {
          const element = itemRefs.current[itemName];
          if (element) {
            // Get the link element which contains the icon
            const linkElement = element.querySelector('a') as HTMLElement;
            if (linkElement) {
              const linkRect = linkElement.getBoundingClientRect();
              const topPos = linkRect.top;
              const leftPos = linkRect.right + 12;

              setTooltipState({
                text: tooltipState.text,
                top: topPos,
                left: leftPos
              });
            }
          }
        }
      };

      window.addEventListener('scroll', updateTooltipPosition, true);
      return () => window.removeEventListener('scroll', updateTooltipPosition, true);
    }
  }, [tooltipState, collapsed]);

  // Helper: check if user's roles overlap with the allowed roles for an item
  const userHasAnyRole = (allowedRoles: UserRole[]) => {
    if (!user || !Array.isArray(user.role)) return false;
    return allowedRoles.some((r) => user.role.includes(r));
  };

  // Filter menu items based on user role (dynamic)
  const menuItems = allMenuItems.filter(item => user && userHasAnyRole(item.roles));

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemExpanded = (itemName: string) => expandedItems.includes(itemName);
  const isItemActive = (item: MenuItem) => {
    if (item.href && pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => pathname === subItem.href);
    }
    return false;
  };

  const isSubItemActive = (subItem: SubMenuItem) => pathname === subItem.href;

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-theme shadow-sm transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-72",
      "overflow-visible"
    )}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-end p-5 compact:p-4 border-b border-border">
        <button onClick={onClose} className="p-2.5 hover:bg-accent rounded-lg transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 p-4 compact:p-3.5 space-y-1 transition-all duration-300 ease-in-out",
        collapsed ? "overflow-y-auto overflow-x-visible" : "overflow-y-auto"
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          const isExpanded = isItemExpanded(item.name);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.name} className="space-y-1 transition-all duration-300 ease-in-out">
              {item.href ? (
                <div 
                  ref={(el) => { itemRefs.current[item.name] = el; }}
                  className="relative"
                  onMouseEnter={() => {
                    if (collapsed && !hasSubItems) {
                      const element = itemRefs.current[item.name];
                      if (element) {
                        const linkElement = element.querySelector('a') as HTMLElement;
                        if (linkElement) {
                          const linkRect = linkElement.getBoundingClientRect();
                          const topPos = linkRect.top;
                          const leftPos = linkRect.right + 12;

                          setTooltipState({
                            text: item.name,
                            top: topPos,
                            left: leftPos
                          });
                        }
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (collapsed) {
                      setTooltipState(null);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer group',
                      collapsed 
                        ? 'justify-center w-full sidebar-item-collapsed' 
                        : 'gap-3 px-3 py-2.5 compact:py-2',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <Icon className={cn(
                      "flex-shrink-0 h-5 w-5 transition-all duration-300 ease-in-out",
                      collapsed && "mx-auto"
                    )} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn(
                      "truncate transition-all duration-300 ease-in-out whitespace-nowrap",
                      collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    )}>{item.name}</span>
                  </Link>
                </div>
              ) : (
                <div 
                  ref={(el) => { itemRefs.current[item.name] = el; }}
                  className="relative"
                  data-sidebar-item={item.name}
                  onMouseEnter={() => {
                    if (collapsed && hasSubItems) {
                      const element = itemRefs.current[item.name];
                      if (element) {
                        const rect = element.getBoundingClientRect();
                        setPopoverPosition({
                          top: rect.top,
                          left: rect.left + rect.width + 8
                        });
                        setHoveredItem(item.name);
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (collapsed) {
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (!relatedTarget || (!relatedTarget.closest('.sidebar-popover') && !relatedTarget.closest('[data-bridge]'))) {
                        setTimeout(() => {
                          if (!document.querySelector('.sidebar-popover:hover') && !document.querySelector('[data-bridge]:hover')) {
                            setHoveredItem(null);
                            setPopoverPosition(null);
                          }
                        }, 50);
                      }
                    }
                  }}
                >
                  <button
                    onClick={() => {
                      if (!collapsed) {
                        toggleExpand(item.name);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer group',
                      collapsed 
                        ? 'justify-center sidebar-item-collapsed' 
                        : 'justify-between gap-3 px-3 py-2.5 compact:py-2',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <div className={cn(
                      "flex items-center transition-all duration-300 ease-in-out",
                      collapsed ? "justify-center w-full" : "gap-3"
                    )}>
                      <Icon className={cn(
                        "flex-shrink-0 h-5 w-5 transition-all duration-300 ease-in-out",
                        collapsed && "mx-auto"
                      )} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={cn(
                        "truncate transition-all duration-300 ease-in-out whitespace-nowrap",
                        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                      )}>{item.name}</span>
                    </div>
                    {hasSubItems && !collapsed && (
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-in-out',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </button>

                  {/* Expanded sub-items (when sidebar is expanded) */}
                  {hasSubItems && !collapsed && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 space-y-0.5 border-l-2 border-border/50 pl-4">
                            {item.subItems!.map((subItem) => {
                              const subActive = isSubItemActive(subItem);
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => {
                                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                      onClose();
                                    }
                                  }}
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-2 compact:py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    subActive
                                      ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary ml-[-4px] pl-[12px]'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                                  )}
                                >
                                  <span className="truncate">{subItem.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Popover menu rendered outside nav to avoid overflow clipping */}
      <AnimatePresence>
        {collapsed && hoveredItem && popoverPosition && (() => {
          const item = menuItems.find(i => i.name === hoveredItem);
          if (!item?.subItems) return null;

          const element = itemRefs.current[hoveredItem];
          const itemRect = element?.getBoundingClientRect();
          const bridgeWidth = 8; // Gap between sidebar and popover

          return (
            <>
              {/* Invisible bridge to prevent hover gap */}
              {itemRect && (
                <div
                  data-bridge
                  className="fixed z-[99] pointer-events-auto"
                  style={{
                    top: `${itemRect.top}px`,
                    left: `${itemRect.left + itemRect.width}px`,
                    width: `${bridgeWidth}px`,
                    height: `${itemRect.height}px`
                  }}
                  onMouseEnter={() => {
                    if (element) {
                      const rect = element.getBoundingClientRect();
                      setPopoverPosition({
                        top: rect.top,
                        left: rect.left + rect.width + bridgeWidth
                      });
                      setHoveredItem(hoveredItem);
                    }
                  }}
                  onMouseLeave={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || (!relatedTarget.closest('.sidebar-popover'))) {
                      setTimeout(() => {
                        if (!document.querySelector('.sidebar-popover:hover')) {
                          setHoveredItem(null);
                          setPopoverPosition(null);
                        }
                      }, 100);
                    }
                  }}
                />
              )}

              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bg-card border border-border rounded-lg shadow-xl z-[100] min-w-[200px] transition-theme sidebar-popover"
                style={{
                  top: `${popoverPosition.top}px`,
                  left: `${popoverPosition.left}px`
                }}
                onMouseEnter={() => {
                  if (element) {
                    const rect = element.getBoundingClientRect();
                    setPopoverPosition({
                      top: rect.top,
                      left: rect.left + rect.width + bridgeWidth
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setPopoverPosition(null);
                }}
              >
                <div>
                  {item.subItems.map((subItem) => {
                    const subActive = isSubItemActive(subItem);
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={() => {
                          setHoveredItem(null);
                          setPopoverPosition(null);
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 block',
                          subActive
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        )}
                      >
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );

  // Tooltip rendered outside sidebar to avoid overflow clipping
  const tooltipContent = tooltipState && (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      transition={{ duration: 0.15 }}
      className="fixed bg-foreground text-background rounded-md text-xs font-medium whitespace-nowrap z-[99] shadow-lg pointer-events-none"
      style={{
        top: `${tooltipState.top}px`,
        left: `${tooltipState.left}px`,
        display: 'flex',
        alignItems: 'center',
        margin: 0,
        padding: '0.25rem 0.5rem',
        lineHeight: '1.4',
        fontSize: '0.75rem',
        borderRadius: '0.375rem'
      }}
    >
      <div 
        className="absolute right-full top-0"
        style={{
          width: 0,
          height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: '4px solid var(--foreground)',
          marginRight: '-4px',
          top: '0.25rem'
        }}
      />
      {tooltipState.text}
    </motion.div>
  );

  return (
    <>
      {/* Tooltip rendered outside sidebar */}
      <AnimatePresence>
        {tooltipContent}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block fixed left-0 h-[calc(100vh-4rem)] compact:h-[calc(100vh-3.5rem)] top-16 compact:top-14 z-20 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 h-screen"
            >
              <div className="flex flex-col h-full bg-card border-r border-border transition-theme shadow-sm">
                {/* Mobile Header */}
                <div className="flex items-center justify-end p-5 compact:p-4 border-b border-border">
                  <button onClick={onClose} className="p-2.5 hover:bg-accent rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Mobile Navigation - reuse same nav logic but without collapse */}
                <nav className="flex-1 p-4 compact:p-3.5 space-y-1 overflow-y-auto">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item);
                    const isExpanded = isItemExpanded(item.name);
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    return (
                      <div key={item.name} className="space-y-1">
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                onClose();
                              }
                            }}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 compact:py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            )}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleExpand(item.name)}
                              className={cn(
                                'w-full flex items-center justify-between gap-3 px-3 py-2.5 compact:py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                                <span className="truncate">{item.name}</span>
                              </div>
                              {hasSubItems && (
                                <ChevronRight
                                  className={cn(
                                    'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                                    isExpanded && 'rotate-90'
                                  )}
                                />
                              )}
                            </button>
                            {hasSubItems && (
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-6 space-y-0.5 border-l-2 border-border/50 pl-4">
                                      {item.subItems!.map((subItem) => {
                                        const subActive = isSubItemActive(subItem);
                                        return (
                                          <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            onClick={() => {
                                              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                onClose();
                                              }
                                            }}
                                            className={cn(
                                              'flex items-center gap-2 px-3 py-2 compact:py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                              subActive
                                                ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary ml-[-4px] pl-[12px]'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                                            )}
                                          >
                                            <span className="truncate">{subItem.name}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
