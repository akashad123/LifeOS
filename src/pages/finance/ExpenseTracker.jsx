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
import { IndianRupee, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useExpenses } from '../../hooks/useExpenses';
import { getLocalIsoDate, parseLocalDate } from '../../utils/dateUtils';
import { formatCurrencyINR } from '../../utils/currencyUtils';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Other'
];

function ExpenseCard({ item, onEdit, onDelete, onView }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
      }
    };
    const timeoutId = setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [item.description]);

  const formattedDate = parseLocalDate(item.expense_date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });

  return (
    <div className="bg-surface border border-border flex flex-col h-[220px] group transition-shadow hover:shadow-sm">
      <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-start gap-2 shrink-0">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 truncate" title={item.title}>{item.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{item.category}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="font-bold text-lg text-primary">{formatCurrencyINR(item.amount)}</div>
        </div>
      </div>
      
      <div className="flex-1 p-4 min-h-0 flex flex-col relative">
        {item.description ? (
          <div ref={contentRef} className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-3">
            {item.description}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No description</p>
        )}
      </div>

      <div className="flex justify-between items-center px-4 py-3 border-t border-border mt-auto shrink-0 bg-gray-50/50">
        {isOverflowing ? (
          <button 
            onClick={() => onView(item)}
            className="text-primary hover:text-primary/80 text-sm font-medium focus:outline-none transition-colors"
          >
            Read more
          </button>
        ) : (
          <div /> /* Spacer */
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(item)} title="Edit Expense">
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(item)} title="Delete Expense">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseTracker() {
  const {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses
  } = useExpenses();

  const today = new Date();
  
  // States
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    expense_date: getLocalIsoDate(new Date()),
    category: 'Other',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month Navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filtering
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // Filter by Month/Year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    result = result.filter(e => {
      const d = parseLocalDate(e.expense_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    // Filter by Category
    if (categoryFilter !== 'All') {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title?.toLowerCase().includes(q) || 
        e.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [expenses, currentDate, categoryFilter, searchQuery]);

  // Derived Summary
  const totalSpentThisMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // We calculate total before search/category filters so it represents the true month total
    const monthExpenses = expenses.filter(e => {
      const d = parseLocalDate(e.expense_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    return monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses, currentDate]);

  // Handlers
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      amount: '',
      expense_date: getLocalIsoDate(new Date()),
      category: 'Other',
      description: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      amount: item.amount.toString(),
      expense_date: item.expense_date,
      category: item.category,
      description: item.description || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const title = formData.title.trim();
    const amount = Number(formData.amount);
    
    if (!title) return setFormError('Title is required.');
    if (isNaN(amount) || amount <= 0) return setFormError('Amount must be a number greater than 0.');
    if (!formData.expense_date) return setFormError('Expense date is required.');
    if (!EXPENSE_CATEGORIES.includes(formData.category)) return setFormError('Invalid category selected.');

    setIsSubmitting(true);
    const dataToSave = {
      title,
      amount,
      expense_date: formData.expense_date,
      category: formData.category,
      description: formData.description.trim() || null
    };

    let result;
    if (editingItem) {
      result = await updateExpense(editingItem.id, dataToSave);
    } else {
      result = await createExpense(dataToSave);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      // Ensure the current view switches to the month of the newly saved expense
      const d = parseLocalDate(formData.expense_date);
      if (d.getFullYear() !== currentDate.getFullYear() || d.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
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
    setIsSubmitting(true);
    const result = await deleteExpense(itemToDelete.id);
    setIsSubmitting(false);

    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(`Failed to delete expense: ${result.error}`);
    }
  };

  // Render
  if (loading) return <LoadingState message="Loading expenses..." />;
  if (error) return <ErrorState title="Failed to load expenses" message={error} onRetry={refreshExpenses} />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expense Tracker" 
        description="Track and manage your personal expenses."
        action={
          <Button onClick={openAddModal} className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16} />
            <span>Add Expense</span>
          </Button>
        }
      />

      <div className="flex flex-col xl:flex-row gap-6">
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
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <Select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-32 sm:w-40"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 px-4 py-2 flex items-center justify-between sm:justify-start gap-4">
          <span className="text-sm font-semibold uppercase text-primary">Total Spent (Month)</span>
          <span className="text-xl font-bold text-primary">{formatCurrencyINR(totalSpentThisMonth)}</span>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
         <EmptyState 
           icon={IndianRupee} 
           title="No expenses found" 
           description={expenses.length === 0 ? "You haven't recorded any expenses yet." : "No expenses match your filters for this month."} 
         />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExpenses.map(item => (
            <ExpenseCard 
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
        title={editingItem ? "Edit Expense" : "Add Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm border bg-red-50 text-red-700 border-red-200">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lunch at Cafe"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isSubmitting}
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Save Expense')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={viewingItem ? viewingItem.title : ''}
      >
        <div className="space-y-6">
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</h4>
                <p className="text-sm font-medium text-gray-900">
                  {viewingItem ? parseLocalDate(viewingItem.expense_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount</h4>
                <p className="text-lg font-bold text-primary">
                  {viewingItem ? formatCurrencyINR(viewingItem.amount) : ''}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {viewingItem?.category}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              {viewingItem?.description ? (
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{viewingItem.description}</div>
              ) : (
                <p className="text-sm text-gray-400 italic">No description provided</p>
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
        title="Delete Expense"
        message={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        isLoading={isSubmitting}
        isDanger={true}
      />
    </div>
  );
}
