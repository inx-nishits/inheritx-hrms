"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { NextUISelect } from '@/components/ui/NextUISelect';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Filter,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { holidays as initialHolidays, type Holiday } from '@/lib/mockData';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function HRHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<Omit<Holiday, 'id'>>({
    name: '',
    date: '',
    type: 'National',
    isRecurring: false,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    let filtered = [...holidays];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(holiday => 
        holiday.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(holiday => holiday.type === selectedType);
    }

    // Apply date filter
    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
      });
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate < today;
      });
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= dateRange.start! && holidayDate <= dateRange.end!;
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered;
  }, [holidays, searchQuery, selectedType, selectedFilter, dateRange]);

  const handleAdd = () => {
    setFormData({
      name: '',
      date: '',
      type: 'National',
      isRecurring: false,
    });
    setShowAddModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      isRecurring: holiday.isRecurring,
    });
    setShowEditModal(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.date) {
      return;
    }

    if (showAddModal) {
      const newHoliday: Holiday = {
        id: `H${String(holidays.length + 1).padStart(3, '0')}`,
        ...formData,
      };
      setHolidays([...holidays, newHoliday]);
      setShowAddModal(false);
    } else if (showEditModal && selectedHoliday) {
      setHolidays(holidays.map(h => 
        h.id === selectedHoliday.id ? { ...selectedHoliday, ...formData } : h
      ));
      setShowEditModal(false);
      setSelectedHoliday(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedHoliday) {
      setHolidays(holidays.filter(h => h.id !== selectedHoliday.id));
      setShowDeleteModal(false);
      setSelectedHoliday(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntil = (dateString: string) => {
    const holidayDate = new Date(dateString);
    holidayDate.setHours(0, 0, 0, 0);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingCount = holidays.filter(h => {
    const d = new Date(h.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  }).length;

  const pastCount = holidays.filter(h => {
    const d = new Date(h.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Holidays Management
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage company holidays and calendar events
            </p>
          </div>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Holiday
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Holidays</p>
                  <p className="text-2xl font-bold text-foreground">{holidays.length}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Past</p>
                  <p className="text-2xl font-bold text-foreground">{pastCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recurring</p>
                  <p className="text-2xl font-bold text-foreground">
                    {holidays.filter(h => h.isRecurring).length}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* First Row - Search and Quick Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search holidays..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <NextUISelect
                  label="Type"
                  placeholder="All Types"
                  value={selectedType}
                  onChange={(value) => setSelectedType(value || 'all')}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'National', label: 'National' },
                    { value: 'Regional', label: 'Regional' },
                    { value: 'Company', label: 'Company' },
                    { value: 'Religious', label: 'Religious' },
                  ]}
                />
                <NextUISelect
                  label="Filter"
                  placeholder="All"
                  value={selectedFilter}
                  onChange={(value) => setSelectedFilter((value || 'all') as 'all' | 'upcoming' | 'past')}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'past', label: 'Past' },
                  ]}
                />
              </div>
              {/* Second Row - Date Range */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-0 w-full">
                  <label className="block text-sm font-semibold mb-2">Date Range</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                  />
                </div>
                {dateRange.start && dateRange.end && (
                  <Button
                    variant="outline"
                    onClick={() => setDateRange({})}
                    className="h-11 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holidays List */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Holidays ({filteredHolidays.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredHolidays.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No holidays found</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredHolidays.map((holiday, index) => {
                    const holidayDate = new Date(holiday.date);
                    const daysUntil = getDaysUntil(holiday.date);
                    const isPast = daysUntil < 0;
                    const isToday = daysUntil === 0;
                    const isTomorrow = daysUntil === 1;

                    return (
                      <motion.div
                        key={holiday.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border border-border/60 rounded-[8px] hover:border-primary/40 hover:bg-accent/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-base font-semibold text-foreground">{holiday.name}</h3>
                              <Badge 
                                variant={
                                  holiday.type === 'National' ? 'default' :
                                  holiday.type === 'Company' ? 'info' :
                                  holiday.type === 'Religious' ? 'warning' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {holiday.type}
                              </Badge>
                              {holiday.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(holiday.date)}</span>
                              </div>
                            </div>
                            {!isPast && (
                              <div className="mt-2">
                                <span className={`text-xs font-medium ${
                                  isToday ? 'text-green-500' : 
                                  isTomorrow ? 'text-blue-500' : 
                                  'text-primary'
                                }`}>
                                  {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `In ${daysUntil} days`}
                                </span>
                              </div>
                            )}
                            {isPast && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {Math.abs(daysUntil)} days ago
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(holiday)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(holiday)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Holiday Modal */}
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          title="Add New Holiday" 
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Holiday Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Christmas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as Holiday['type'] })}
                options={[
                  { value: 'National', label: 'National' },
                  { value: 'Regional', label: 'Regional' },
                  { value: 'Company', label: 'Company' },
                  { value: 'Religious', label: 'Religious' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                Recurring holiday (repeats annually)
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={!formData.name || !formData.date}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Holiday
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Holiday Modal */}
        <Modal 
          isOpen={showEditModal} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedHoliday(null);
          }} 
          title="Edit Holiday" 
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Holiday Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Christmas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <NextUISelect
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as Holiday['type'] })}
                options={[
                  { value: 'National', label: 'National' },
                  { value: 'Regional', label: 'Regional' },
                  { value: 'Company', label: 'Company' },
                  { value: 'Religious', label: 'Religious' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-recurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="edit-recurring" className="text-sm font-medium cursor-pointer">
                Recurring holiday (repeats annually)
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={!formData.name || !formData.date}
              >
                <Save className="h-4 w-4 mr-2" />
                Update Holiday
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedHoliday(null);
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedHoliday(null);
          }} 
          title="Delete Holiday" 
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-[8px]">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Are you sure you want to delete <strong>{selectedHoliday?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete} 
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHoliday(null);
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

