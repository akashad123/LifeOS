import React, { useState, useMemo, useRef, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { StickyNote, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { getLocalIsoDate, parseLocalDate } from '../../utils/dateUtils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatDateDisplay = (dateStr) => {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

function DailyNoteCard({ item, onEdit, onDelete, onView }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const workRef = useRef(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      let overflow = false;
      if (workRef.current && workRef.current.scrollHeight > workRef.current.clientHeight) overflow = true;
      if (pendingRef.current && pendingRef.current.scrollHeight > pendingRef.current.clientHeight) overflow = true;
      setIsOverflowing(overflow);
    };
    
    const timeoutId = setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [item.work_completed, item.pending_work]);

  return (
    <div className="bg-surface border border-border flex flex-col h-[320px] group transition-shadow hover:shadow-sm">
      <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-start gap-2 shrink-0">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate" title={formatDateDisplay(item.note_date)}>
            {formatDateDisplay(item.note_date)}
          </h3>
          {item.title && (
            <p className="text-sm font-medium text-gray-700 mt-0.5 truncate" title={item.title}>
              {item.title}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4 min-h-0 flex flex-col space-y-4">
        {item.work_completed ? (
          <div className="flex flex-col min-h-0">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 shrink-0">Work Completed</h4>
            <div ref={workRef} className="text-sm text-gray-800 whitespace-pre-wrap break-words line-clamp-3">
              {item.work_completed}
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-0">
             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 shrink-0">Work Completed</h4>
             <p className="text-sm text-gray-400">—</p>
          </div>
        )}

        {item.pending_work ? (
          <div className="flex flex-col min-h-0">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 shrink-0">Pending Work</h4>
            <div ref={pendingRef} className="text-sm text-gray-800 whitespace-pre-wrap break-words line-clamp-3">
              {item.pending_work}
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-0">
             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 shrink-0">Pending Work</h4>
             <p className="text-sm text-gray-400">—</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-4 py-3 border-t border-border mt-auto shrink-0 bg-gray-50/50">
        {isOverflowing ? (
          <button 
            onClick={() => onView(item)}
            className="text-primary hover:text-primary/80 text-sm font-medium focus:outline-none transition-colors shrink-0"
          >
            Read more
          </button>
        ) : (
          <div /> /* Spacer */
        )}
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => onEdit(item)} title="Edit Note">
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(item)} title="Delete Note">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DailyNotes() {
  const {
    notes,
    loading: itemsLoading,
    error: itemsError,
    addNote,
    editNote,
    removeNote,
    refreshNotes
  } = useDailyNotes();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // View Modal State
  const [viewingItem, setViewingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    note_date: getLocalIsoDate(),
    title: '',
    work_completed: '',
    pending_work: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [yearFilter, setYearFilter] = useState('All Years');

  // Generate Year options dynamically based on notes + current calendar year
  const availableYears = useMemo(() => {
    const years = new Set(notes.map(n => parseLocalDate(n.note_date).getFullYear()));
    years.add(new Date().getFullYear()); // always include current year
    return Array.from(years).sort((a, b) => b - a); // descending
  }, [notes]);

  // Derived Summary Metric
  const notesThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return notes.filter(n => {
      const d = parseLocalDate(n.note_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const dateObj = parseLocalDate(n.note_date);
      
      if (yearFilter !== 'All Years' && dateObj.getFullYear().toString() !== yearFilter) {
        return false;
      }
      if (monthFilter !== 'All Months' && MONTHS[dateObj.getMonth()] !== monthFilter) {
        return false;
      }
      
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        (n.title?.toLowerCase().includes(q)) ||
        (n.work_completed?.toLowerCase().includes(q)) ||
        (n.pending_work?.toLowerCase().includes(q))
      );
    });
  }, [notes, yearFilter, monthFilter, searchQuery]);

  // Handlers
  const handleOpenAddFlow = () => {
    const todayIso = getLocalIsoDate();
    
    // Check if a note already exists for today
    const existingToday = notes.find(n => n.note_date === todayIso);
    if (existingToday) {
      openEditModal(existingToday, 'A note already exists for today. Editing the existing note.');
    } else {
      openAddModal(todayIso);
    }
  };

  const openAddModal = (dateValue) => {
    setEditingItem(null);
    setFormData({
      note_date: dateValue,
      title: '',
      work_completed: '',
      pending_work: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item, customErrorMsg = '') => {
    setEditingItem(item);
    setFormData({
      note_date: item.note_date,
      title: item.title || '',
      work_completed: item.work_completed || '',
      pending_work: item.pending_work || ''
    });
    setFormError(customErrorMsg); // Useful for "Already exists" notifications
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const dateVal = formData.note_date;
    if (!dateVal) {
      setFormError('Note Date is required.');
      return;
    }

    const titleStr = formData.title.trim();
    const workCompletedStr = formData.work_completed.trim();
    const pendingWorkStr = formData.pending_work.trim();

    if (!titleStr && !workCompletedStr && !pendingWorkStr) {
      setFormError('Please enter some content for the note.');
      return;
    }

    // UNIQUE constraint protection: Check if date is taken by ANOTHER note
    const existingDateNote = notes.find(n => n.note_date === dateVal);
    if (existingDateNote) {
      if (!editingItem || editingItem.id !== existingDateNote.id) {
        setFormError(`A note already exists for ${dateVal}.`);
        return;
      }
    }

    setIsSubmitting(true);
    
    const dataToSave = {
      note_date: dateVal,
      title: titleStr || null,
      work_completed: workCompletedStr || null,
      pending_work: pendingWorkStr || null
    };

    let result;
    if (editingItem) {
      result = await editNote(editingItem.id, dataToSave);
    } else {
      result = await addNote(dataToSave);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const result = await removeNote(itemToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  // (Format function moved outside)

  if (itemsLoading) return <LoadingState message="Loading daily notes..." />;
  if (itemsError) return <ErrorState title="Failed to load daily notes" message={itemsError} onRetry={refreshNotes} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Daily Notes" 
          description="A structured daily wrap-up of your professional accomplishments and pending work." 
        />
        <Button onClick={handleOpenAddFlow} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Note
        </Button>
      </div>

      {/* Summary Section */}
      <div className="max-w-xs">
        <div className="bg-surface border border-border p-4 flex flex-col justify-center text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes This Month</span>
          <span className="text-2xl font-bold text-gray-900">{notesThisMonth}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <Input 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-4 sm:shrink-0 w-full sm:w-auto">
          <Select 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full sm:w-40 shrink-0"
          >
            <option value="All Months">All Months</option>
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full sm:w-32 shrink-0"
          >
            <option value="All Years">All Years</option>
            {availableYears.map(y => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </Select>
          <div className="text-sm text-gray-500 whitespace-nowrap text-right flex-1 sm:flex-none">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState 
           icon={StickyNote} 
           title="No daily notes yet."
           description="Start your professional journal by writing a daily wrap-up." 
           action={<Button onClick={handleOpenAddFlow}>Add Note</Button>}
         />
      ) : filteredNotes.length === 0 ? (
        <EmptyState 
           icon={Search} 
           title="No notes match your current filters."
           description="Try changing your search, month, or year filter." 
         />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(item => (
            <DailyNoteCard 
              key={item.id} 
              item={item} 
              onEdit={openEditModal} 
              onDelete={confirmDelete} 
              onView={setViewingItem} 
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Note' : 'Add Note'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className={`p-3 text-sm border ${formError.includes('already exists') && formError.includes('Editing') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <Input
                type="date"
                value={formData.note_date}
                onChange={(e) => setFormData({ ...formData, note_date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. End of Q3 Sprint"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Completed</label>
            <Textarea
              value={formData.work_completed}
              onChange={(e) => setFormData({ ...formData, work_completed: e.target.value })}
              placeholder="What did you accomplish today?"
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pending Work</label>
            <Textarea
              value={formData.pending_work}
              onChange={(e) => setFormData({ ...formData, pending_work: e.target.value })}
              placeholder="What needs to carry over to tomorrow?"
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Save Note')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={viewingItem ? `${formatDateDisplay(viewingItem.note_date)}${viewingItem.title ? ` - ${viewingItem.title}` : ''}` : ''}
      >
        <div className="space-y-6">
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Completed</h4>
              {viewingItem?.work_completed ? (
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{viewingItem.work_completed}</div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Work</h4>
              {viewingItem?.pending_work ? (
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{viewingItem.pending_work}</div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button variant="secondary" onClick={() => setViewingItem(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Note"
        message={`Are you sure you want to delete the note for ${itemToDelete ? formatDateDisplay(itemToDelete.note_date) : ''}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
}
