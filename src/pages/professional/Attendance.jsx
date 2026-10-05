import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Plus, Edit2, CheckSquare, Square, List } from 'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';
import { useReminders } from '../../hooks/useReminders';
import { getLocalIsoDate, parseLocalDate } from '../../utils/dateUtils';

const STATUS_OPTIONS = [
  'Present',
  'Absent',
  'Leave',
  'Holiday',
  'Half Day',
  'Work From Home'
];

const STATUS_STYLES = {
  'Present': 'bg-green-50 text-green-800 border-green-200',
  'Absent': 'bg-red-50 text-red-800 border-red-200',
  'Leave': 'bg-orange-50 text-orange-800 border-orange-200',
  'Holiday': 'bg-blue-50 text-blue-800 border-blue-200',
  'Half Day': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Work From Home': 'bg-purple-50 text-purple-800 border-purple-200'
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Attendance() {
  const {
    records,
    loading: attLoading,
    error: attError,
    addRecord,
    editRecord,
    removeRecord,
    refreshRecords
  } = useAttendance();

  const {
    reminders,
    loading: remLoading,
    error: remError,
    createReminder,
    updateReminder,
    deleteReminder,
    refreshReminders
  } = useReminders();

  // Calendar State
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDateIso, setSelectedDateIso] = useState('');

  // All Reminders Modal State
  const [isAllRemindersOpen, setIsAllRemindersOpen] = useState(false);
  const [reminderFilter, setReminderFilter] = useState('Upcoming'); // 'All', 'Upcoming', 'Completed'
  const [reminderSearch, setReminderSearch] = useState('');

  // Attendance Form State
  const [formData, setFormData] = useState({
    status: 'Present',
    remarks: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reminder Form State
  const [editingReminder, setEditingReminder] = useState(null); // id of reminder being edited, or 'new'
  const [reminderData, setReminderData] = useState({ title: '', reminder_time: '', notes: '' });
  const [reminderError, setReminderError] = useState('');
  const [isReminderSubmitting, setIsReminderSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [reminderDeleteConfirmOpen, setReminderDeleteConfirmOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [isReminderDeleting, setIsReminderDeleting] = useState(false);

  // Calendar Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Generate Calendar Grid
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayIndex = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const isoStr = getLocalIsoDate(d);
      cells.push({
        day,
        dateObj: d,
        isoStr,
        isToday: isoStr === getLocalIsoDate(today)
      });
    }
    
    const totalCells = cells.length;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < (7 - remainder); i++) cells.push(null);
    }
    
    return cells;
  }, [currentDate]);

  // Derived Summary Metric for Current Month
  const summaryCounts = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const counts = {
      'Present': 0,
      'Absent': 0,
      'Leave': 0,
      'Holiday': 0,
      'Half Day': 0,
      'Work From Home': 0,
      'Reminders': 0
    };
    
    records.forEach(r => {
      const d = parseLocalDate(r.record_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (counts[r.status] !== undefined) counts[r.status]++;
      }
    });

    reminders.forEach(r => {
      const d = parseLocalDate(r.reminder_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        counts['Reminders']++;
      }
    });
    
    return counts;
  }, [records, reminders, currentDate]);

  const todayIso = useMemo(() => getLocalIsoDate(new Date()), []);

  const todayRecord = useMemo(() => {
    return records.find(r => r.record_date === todayIso);
  }, [records, todayIso]);

  const globalUpcomingRemindersCount = useMemo(() => {
    return reminders.filter(r => !r.is_completed && r.reminder_date >= todayIso).length;
  }, [reminders, todayIso]);

  const filteredAllReminders = useMemo(() => {
    let result = reminders;

    if (reminderFilter === 'Upcoming') {
      result = result.filter(r => !r.is_completed && r.reminder_date >= todayIso);
    } else if (reminderFilter === 'Completed') {
      result = result.filter(r => r.is_completed);
    }

    if (reminderSearch.trim()) {
      const q = reminderSearch.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(q) || 
        r.notes?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [reminders, reminderFilter, reminderSearch, todayIso]);

  // Handlers
  const openDateModal = (isoDate) => {
    const existingRecord = records.find(r => r.record_date === isoDate);
    setSelectedDateIso(isoDate);
    
    if (existingRecord) {
      setEditingItem(existingRecord);
      setFormData({
        status: existingRecord.status || 'Present',
        remarks: existingRecord.remarks || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        status: 'Present',
        remarks: ''
      });
    }
    
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCellClick = (cell) => {
    if (!cell) return;
    setEditingReminder(null);
    openDateModal(cell.isoStr);
  };

  const jumpToDate = (isoDate) => {
    setIsAllRemindersOpen(false);
    const d = parseLocalDate(isoDate);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setEditingReminder(null);
    openDateModal(isoDate);
  };

  const jumpToDateAndEdit = (rem) => {
    setIsAllRemindersOpen(false);
    const d = parseLocalDate(rem.reminder_date);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    openDateModal(rem.reminder_date);
    
    setEditingReminder(rem.id);
    setReminderData({
      title: rem.title,
      reminder_time: rem.reminder_time || '',
      notes: rem.notes || ''
    });
  };

  const closeModal = () => {
    if (!isSubmitting && !isReminderSubmitting) setIsModalOpen(false);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!STATUS_OPTIONS.includes(formData.status)) {
      setFormError('Invalid status selected.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      record_date: selectedDateIso,
      status: formData.status,
      remarks: formData.remarks.trim() || null
    };

    let result;
    if (editingItem) {
      result = await editRecord(editingItem.id, dataToSave);
      if (result.success) {
         setEditingItem(result.data);
      }
    } else {
      result = await addRecord(dataToSave);
      if (result.success) {
         setEditingItem(result.data);
      }
    }

    setIsSubmitting(false);
    if (!result.success) setFormError(result.error);
  };

  const confirmDeleteAttendance = () => setDeleteConfirmOpen(true);

  const handleDeleteAttendance = async () => {
    if (!editingItem) return;
    setIsDeleting(true);
    const result = await removeRecord(editingItem.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setEditingItem(null);
      setFormData({ status: 'Present', remarks: '' });
    } else {
      alert(`Failed to clear record: ${result.error}`);
    }
  };

  const handleQuickMarkToday = async (statusToMark) => {
    setIsSubmitting(true);
    const dataToSave = {
      record_date: todayIso,
      status: statusToMark,
      remarks: todayRecord?.remarks || null
    };

    if (todayRecord) {
      await editRecord(todayRecord.id, dataToSave);
    } else {
      await addRecord(dataToSave);
    }
    setIsSubmitting(false);
  };

  const handleQuickSaveStatus = async (statusToSave) => {
    setFormError('');
    if (!STATUS_OPTIONS.includes(statusToSave)) {
      setFormError('Invalid status selected.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      record_date: selectedDateIso,
      status: statusToSave,
      remarks: formData.remarks.trim() || null
    };

    let result;
    if (editingItem) {
      result = await editRecord(editingItem.id, dataToSave);
      if (result.success) {
        setEditingItem(result.data);
        setFormData(prev => ({ ...prev, status: statusToSave }));
      }
    } else {
      result = await addRecord(dataToSave);
      if (result.success) {
        setEditingItem(result.data);
        setFormData(prev => ({ ...prev, status: statusToSave }));
      }
    }

    setIsSubmitting(false);
    if (!result.success) setFormError(result.error);
  };

  // Reminder Handlers
  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    setReminderError('');

    const title = reminderData.title.trim();
    if (!title) {
      setReminderError('Title is required.');
      return;
    }

    setIsReminderSubmitting(true);
    const dataToSave = {
      reminder_date: selectedDateIso,
      title,
      reminder_time: reminderData.reminder_time || null,
      notes: reminderData.notes.trim() || null
    };

    let result;
    if (editingReminder === 'new') {
      result = await createReminder(dataToSave);
    } else {
      result = await updateReminder(editingReminder, dataToSave);
    }

    setIsReminderSubmitting(false);

    if (result.success) {
      setEditingReminder(null);
    } else {
      setReminderError(result.error);
    }
  };

  const toggleReminderComplete = async (reminder) => {
    await updateReminder(reminder.id, { is_completed: !reminder.is_completed });
  };

  const confirmDeleteReminder = (reminder) => {
    setReminderToDelete(reminder);
    setReminderDeleteConfirmOpen(true);
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;
    setIsReminderDeleting(true);
    const result = await deleteReminder(reminderToDelete.id);
    setIsReminderDeleting(false);

    if (result.success) {
      setReminderDeleteConfirmOpen(false);
      setReminderToDelete(null);
    } else {
      alert(`Failed to delete reminder: ${result.error}`);
    }
  };

  const formatModalDate = (isoStr) => {
    const d = parseLocalDate(isoStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hInt = parseInt(h, 10);
    const ampm = hInt >= 12 ? 'PM' : 'AM';
    hInt = hInt % 12 || 12;
    return `${hInt}:${m} ${ampm}`;
  };

  if (attLoading || remLoading) return <LoadingState message="Loading data..." />;
  if (attError) return <ErrorState title="Failed to load attendance" message={attError} onRetry={refreshRecords} />;
  if (remError) return <ErrorState title="Failed to load reminders" message={remError} onRetry={refreshReminders} />;

  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const selectedDateReminders = reminders.filter(r => r.reminder_date === selectedDateIso);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reminders & Attendance" 
        description="Track your personal work attendance and manage daily reminders." 
      />

      {/* Navigation & Summary Container */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </Button>
            <div className="w-32 sm:w-48 text-center font-bold text-lg text-gray-900 border border-border bg-surface py-2">
              {monthYearLabel}
            </div>
            <Button variant="secondary" onClick={nextMonth} title="Next Month">
              <ChevronRight size={18} />
            </Button>
            <Button variant="secondary" onClick={goToday} className="ml-2 flex items-center gap-2">
              <CalendarIcon size={16} />
              <span className="hidden sm:inline">Today</span>
            </Button>
          </div>

          {/* Quick Mark Today Buttons */}
          <div className="flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickMarkToday('Present')}
                disabled={isSubmitting}
                className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  todayRecord?.status === 'Present'
                    ? 'bg-green-700 text-white border-green-800 shadow-sm'
                    : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                }`}
                title="Mark Today as Present"
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => handleQuickMarkToday('Absent')}
                disabled={isSubmitting}
                className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  todayRecord?.status === 'Absent'
                    ? 'bg-red-700 text-white border-red-800 shadow-sm'
                    : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                }`}
                title="Mark Today as Absent"
              >
                Absent
              </button>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={() => setIsAllRemindersOpen(true)} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <List size={16} />
            <span>View All Reminders</span>
          </Button>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {/* Always show Present */}
            <div className="bg-green-50 border border-green-200 px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-green-800">Present</span>
              <span className="text-sm font-bold text-green-900">{summaryCounts['Present']}</span>
            </div>

            {/* Always show Absent */}
            <div className="bg-red-50 border border-red-200 px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-red-800">Absent</span>
              <span className="text-sm font-bold text-red-900">{summaryCounts['Absent']}</span>
            </div>

            {/* Other Statuses if > 0 */}
            {STATUS_OPTIONS.filter(s => s !== 'Present' && s !== 'Absent').map(status => {
              if (summaryCounts[status] === 0) return null;
              return (
                <div key={status} className="bg-surface border border-border px-3 py-1.5 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-gray-500">{status}</span>
                  <span className="text-sm font-bold text-gray-900">{summaryCounts[status]}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {summaryCounts['Reminders'] > 0 && (
              <div className="bg-surface border border-border px-3 py-1.5 flex items-center gap-2" title="Reminders in this month view">
                <span className="text-xs font-semibold uppercase text-gray-500 hidden sm:inline">Month Reminders</span>
                <span className="text-xs font-semibold uppercase text-gray-500 sm:hidden">Month</span>
                <span className="text-sm font-bold text-gray-900">{summaryCounts['Reminders']}</span>
              </div>
            )}
            
            <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 flex items-center gap-2 flex-1 justify-between sm:justify-start">
              <span className="text-xs font-semibold uppercase text-primary">Upcoming Reminders</span>
              <span className="text-sm font-bold text-primary">{globalUpcomingRemindersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface border border-border">
        {/* Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-gray-50">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-border last:border-r-0">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>
        
        {/* Body */}
        <div className="grid grid-cols-7">
          {calendarData.map((cell, index) => {
            if (!cell) {
              return (
                <div key={`blank-${index}`} className="min-h-[100px] sm:min-h-[120px] bg-gray-50/50 border-r border-b border-border last:border-r-0" />
              );
            }

            const existingRecord = records.find(r => r.record_date === cell.isoStr);
            const statusStyle = existingRecord ? STATUS_STYLES[existingRecord.status] || 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-transparent text-gray-700 hover:bg-gray-50';
            const isTodayClass = cell.isToday ? 'border-primary border-2 z-10' : 'border-border border-b border-r';
            
            const cellReminders = reminders.filter(r => r.reminder_date === cell.isoStr);

            return (
              <div 
                key={cell.isoStr}
                onClick={() => handleCellClick(cell)}
                className={`min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 cursor-pointer transition-colors ${isTodayClass} ${existingRecord || cellReminders.length > 0 ? '' : 'last:border-r-0'}`}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-right text-sm font-medium ${cell.isToday ? 'text-primary' : 'text-gray-500'}`}>
                    {cell.day}
                  </div>
                  
                  <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                    {existingRecord && (
                      <div className={`text-xs font-semibold px-1.5 py-0.5 sm:py-1 border ${statusStyle} truncate text-center break-words whitespace-normal leading-tight`} title={existingRecord.status}>
                        {existingRecord.status}
                      </div>
                    )}
                    
                    {cellReminders.slice(0, 2).map(rem => (
                       <div key={rem.id} className={`text-[10px] sm:text-xs truncate ${rem.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                         • {rem.title} {rem.reminder_time && <span className="opacity-75 hidden sm:inline">· {formatTime(rem.reminder_time)}</span>}
                       </div>
                    ))}
                    
                    {cellReminders.length > 2 && (
                       <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                         +{cellReminders.length - 2} more
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDateIso ? formatModalDate(selectedDateIso) : ''}
      >
        <div className="space-y-6">
          {/* ATTENDANCE SECTION */}
          <div className="border border-border p-4 bg-gray-50/30">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Attendance</h3>
              {editingItem && (
                <span className={`text-xs font-bold px-2 py-0.5 border ${STATUS_STYLES[editingItem.status] || ''}`}>
                  Current: {editingItem.status}
                </span>
              )}
            </div>

            {/* Quick One-Click Actions */}
            <div className="mb-4 p-3 bg-surface border border-border">
              <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Quick Action (1-Click)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSaveStatus('Present')}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                    formData.status === 'Present' && editingItem
                      ? 'bg-green-700 text-white border-green-800 shadow-sm'
                      : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                  }`}
                >
                  ✓ Mark Present
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSaveStatus('Absent')}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                    formData.status === 'Absent' && editingItem
                      ? 'bg-red-700 text-white border-red-800 shadow-sm'
                      : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                  }`}
                >
                  ✕ Mark Absent
                </button>
              </div>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 text-sm border bg-red-50 text-red-700 border-red-200">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map(status => {
                    const isSelected = formData.status === status;
                    const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-300';
                    return (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setFormData(prev => ({ ...prev, status }))}
                        disabled={isSubmitting}
                        className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                          isSelected
                            ? `${style} ring-2 ring-primary ring-offset-1 shadow-sm font-extrabold`
                            : 'bg-surface text-gray-600 border-border hover:bg-gray-50'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Sick leave, Personal reason, Official offsite..."
                  disabled={isSubmitting}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 justify-between pt-2">
                <div>
                  {editingItem && (
                    <Button type="button" variant="danger" onClick={confirmDeleteAttendance} disabled={isSubmitting}>
                      Clear Record
                    </Button>
                  )}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </form>
          </div>

          {/* REMINDERS SECTION */}
          <div className="border border-border p-4 bg-gray-50/30">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-2 mb-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reminders</h3>
               {!editingReminder && (
                 <Button 
                   variant="secondary" 
                   onClick={() => {
                     setEditingReminder('new');
                     setReminderData({ title: '', reminder_time: '', notes: '' });
                     setReminderError('');
                   }}
                   className="inline-flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                 >
                   <Plus size={16} /> Add Reminder
                 </Button>
               )}
             </div>

             {editingReminder ? (
                <form onSubmit={handleReminderSubmit} className="space-y-3 bg-white p-3 border border-border mb-4">
                  {reminderError && (
                    <div className="p-2 text-sm border bg-red-50 text-red-700 border-red-200">
                      {reminderError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                    <Input 
                      value={reminderData.title}
                      onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })}
                      placeholder="e.g. Pay electricity bill"
                      disabled={isReminderSubmitting}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Time (Optional)</label>
                      <Input 
                        type="time"
                        value={reminderData.reminder_time}
                        onChange={(e) => setReminderData({ ...reminderData, reminder_time: e.target.value })}
                        disabled={isReminderSubmitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <Textarea 
                      value={reminderData.notes}
                      onChange={(e) => setReminderData({ ...reminderData, notes: e.target.value })}
                      placeholder="Any additional details..."
                      disabled={isReminderSubmitting}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="secondary" onClick={() => setEditingReminder(null)} disabled={isReminderSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isReminderSubmitting}>
                      {isReminderSubmitting ? 'Saving...' : 'Save Reminder'}
                    </Button>
                  </div>
                </form>
             ) : (
                <div className="space-y-2">
                  {selectedDateReminders.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">No reminders for this date.</div>
                  ) : (
                    selectedDateReminders.map(rem => (
                      <div key={rem.id} className={`flex items-start gap-3 p-3 border border-border bg-white transition-opacity ${rem.is_completed ? 'opacity-60' : ''}`}>
                        <button 
                          onClick={() => toggleReminderComplete(rem)}
                          className="mt-0.5 text-gray-400 hover:text-primary transition-colors focus:outline-none shrink-0"
                        >
                          {rem.is_completed ? <CheckSquare size={18} className="text-green-600" /> : <Square size={18} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold truncate ${rem.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {rem.title}
                            </h4>
                          </div>
                          {(rem.reminder_time || rem.notes) && (
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              {rem.reminder_time && <span>{formatTime(rem.reminder_time)}</span>}
                              {rem.notes && <span className="line-clamp-2 italic">{rem.notes}</span>}
                            </div>
                          )}
                        </div>
                        {/* Always show action buttons even without group hover for mobile compatibility */}
                        <div className="flex gap-1 shrink-0 ml-2">
                           <button 
                             onClick={() => {
                               setEditingReminder(rem.id);
                               setReminderData({
                                 title: rem.title,
                                 reminder_time: rem.reminder_time || '',
                                 notes: rem.notes || ''
                               });
                             }}
                             className="p-1.5 text-gray-400 hover:text-primary"
                             title="Edit Reminder"
                           >
                             <Edit2 size={14} />
                           </button>
                           <button 
                             onClick={() => confirmDeleteReminder(rem)}
                             className="p-1.5 text-gray-400 hover:text-danger"
                             title="Delete Reminder"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             )}
          </div>
          
          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* All Reminders Modal */}
      <Modal
        isOpen={isAllRemindersOpen}
        onClose={() => setIsAllRemindersOpen(false)}
        title="All Reminders"
      >
        <div className="space-y-4">
          <Input 
            placeholder="Search reminders..." 
            value={reminderSearch}
            onChange={(e) => setReminderSearch(e.target.value)}
          />
          <div className="flex gap-2 border-b border-border pb-4">
             <Button variant={reminderFilter === 'All' ? 'primary' : 'secondary'} onClick={() => setReminderFilter('All')} size="sm">All</Button>
             <Button variant={reminderFilter === 'Upcoming' ? 'primary' : 'secondary'} onClick={() => setReminderFilter('Upcoming')} size="sm">Upcoming</Button>
             <Button variant={reminderFilter === 'Completed' ? 'primary' : 'secondary'} onClick={() => setReminderFilter('Completed')} size="sm">Completed</Button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            {filteredAllReminders.length === 0 ? (
               <div className="text-gray-500 text-sm py-4 text-center border border-border bg-surface">No reminders found.</div>
            ) : (
               filteredAllReminders.map(rem => (
                 <div key={rem.id} className={`p-4 border border-border bg-surface transition-opacity ${rem.is_completed ? 'opacity-60' : ''}`}>
                   <div className="flex justify-between items-start mb-2">
                     <div className="min-w-0 pr-4">
                       <h4 className={`font-bold text-gray-900 truncate ${rem.is_completed ? 'line-through text-gray-500' : ''}`}>{rem.title}</h4>
                       <div className="text-xs font-semibold text-gray-500 flex items-center gap-2 mt-1">
                          <span>{formatModalDate(rem.reminder_date)}</span>
                          {rem.reminder_time && <span>• {formatTime(rem.reminder_time)}</span>}
                       </div>
                     </div>
                     <button 
                       onClick={() => toggleReminderComplete(rem)}
                       className="text-gray-400 hover:text-primary transition-colors focus:outline-none shrink-0 mt-0.5"
                       title={rem.is_completed ? 'Undo Complete' : 'Mark Complete'}
                     >
                       {rem.is_completed ? <CheckSquare size={20} className="text-green-600" /> : <Square size={20} />}
                     </button>
                   </div>
                   
                   {rem.notes && (
                     <div className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-3 mb-3">
                       {rem.notes}
                     </div>
                   )}
                   
                   <div className="flex justify-between sm:justify-end gap-2 mt-3 pt-3 border-t border-border">
                     <Button variant="secondary" size="sm" onClick={() => jumpToDate(rem.reminder_date)} className="flex-1 sm:flex-none justify-center">
                       Go to Date
                     </Button>
                     <div className="flex gap-2 shrink-0">
                       <Button variant="secondary" size="sm" onClick={() => jumpToDateAndEdit(rem)} title="Edit Reminder">
                         <Edit2 size={14} />
                       </Button>
                       <Button variant="danger" size="sm" onClick={() => confirmDeleteReminder(rem)} title="Delete Reminder">
                         <Trash2 size={14} />
                       </Button>
                     </div>
                   </div>
                 </div>
               ))
            )}
          </div>
          
          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setIsAllRemindersOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Attendance Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Clear Attendance Record"
        message={`Are you sure you want to clear the attendance record for ${selectedDateIso ? formatModalDate(selectedDateIso) : ''}? This will leave the day unrecorded.`}
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAttendance}
        onCancel={() => setDeleteConfirmOpen(false)}
        isLoading={isDeleting}
        isDanger={true}
      />
      
      {/* Delete Reminder Confirmation */}
      <ConfirmDialog
        isOpen={reminderDeleteConfirmOpen}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.title}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteReminder}
        onCancel={() => {
          setReminderDeleteConfirmOpen(false);
          setReminderToDelete(null);
        }}
        isLoading={isReminderDeleting}
        isDanger={true}
      />
    </div>
  );
}
