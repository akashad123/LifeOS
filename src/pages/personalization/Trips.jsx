import React, { useState, useMemo } from 'react';
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
import { Plane, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAnnualTrips } from '../../hooks/useAnnualTrips';
import { formatCurrencyINR } from '../../utils/currencyUtils';
import { parseLocalDate, getLocalIsoDate } from '../../utils/dateUtils';

const CATEGORIES = [
  'Vacation',
  'Family & Personal',
  'Professional & Work',
  'Weekend Getaway',
  'Pilgrimage & Spiritual',
  'Education & Study',
  'Special Event',
  'Other'
];

export default function Trips() {
  const { 
    trips, 
    loading: itemsLoading, 
    error: itemsError, 
    addTrip, 
    editTrip, 
    removeTrip, 
    refreshTrips 
  } = useAnnualTrips();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    trip_name: '', 
    destination: '',
    category: 'Other',
    start_date: '',
    end_date: '',
    fuel_cost: '0',
    food_cost: '0',
    stay_cost: '0',
    other_cost: '0',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract years for filter
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const years = new Set(trips.map(t => t.start_date.substring(0, 4)));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // descending
  }, [trips]);

  // Filter State
  const currentYearString = new Date().getFullYear().toString();
  const [yearFilter, setYearFilter] = useState(availableYears.includes(currentYearString) ? currentYearString : availableYears[0] || currentYearString);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Status and Duration logic
  const getStatus = (start, end) => {
    const todayStr = getLocalIsoDate();
    
    if (todayStr < start) return 'Upcoming';
    
    if (end && todayStr > end) return 'Completed';
    
    if (todayStr >= start && (!end || todayStr <= end)) return 'Ongoing';
    
    return 'Unknown';
  };

  const calculateDuration = (start, end) => {
    if (!end) return '—';
    const startDate = parseLocalDate(start);
    const endDate = parseLocalDate(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  const calculateTotalCost = (item) => {
    return Number(item.fuel_cost) + Number(item.food_cost) + Number(item.stay_cost) + Number(item.other_cost);
  };

  const formatDateRange = (start, end) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const startStr = parseLocalDate(start).toLocaleDateString('en-US', options);
    if (!end) return startStr;
    const endStr = parseLocalDate(end).toLocaleDateString('en-US', options);
    return `${startStr} – ${endStr}`;
  };

  // Derive filtered items
  const filteredItems = useMemo(() => {
    return trips.filter(item => {
      // 1. Year check
      const itemYear = item.start_date.substring(0, 4);
      if (itemYear !== yearFilter) return false;

      // 2. Category check
      if (categoryFilter !== 'All Categories' && item.category !== categoryFilter) return false;

      // 3. Status check
      if (statusFilter !== 'All Statuses' && getStatus(item.start_date, item.end_date) !== statusFilter) return false;

      // 4. Search check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      
      return (
        (item.trip_name?.toLowerCase().includes(q)) ||
        (item.destination?.toLowerCase().includes(q)) ||
        (item.notes?.toLowerCase().includes(q))
      );
    });
  }, [trips, yearFilter, categoryFilter, statusFilter, searchQuery]);

  // Derived Summary (based on yearFilter only, ignoring search/status filters to show true annual summary)
  const annualTrips = trips.filter(item => item.start_date.substring(0, 4) === yearFilter);
  const totalTrips = annualTrips.length;
  const totalExpenses = annualTrips.reduce((sum, item) => sum + calculateTotalCost(item), 0);
  const upcomingCount = annualTrips.filter(item => getStatus(item.start_date, item.end_date) === 'Upcoming').length;
  const completedCount = annualTrips.filter(item => getStatus(item.start_date, item.end_date) === 'Completed').length;

  const countFiltered = filteredItems.length;

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      trip_name: '', 
      destination: '',
      category: 'Other',
      start_date: getLocalIsoDate(),
      end_date: '',
      fuel_cost: '0',
      food_cost: '0',
      stay_cost: '0',
      other_cost: '0',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      trip_name: item.trip_name, 
      destination: item.destination,
      category: item.category || 'Other',
      start_date: item.start_date,
      end_date: item.end_date || '',
      fuel_cost: item.fuel_cost.toString(),
      food_cost: item.food_cost.toString(),
      stay_cost: item.stay_cost.toString(),
      other_cost: item.other_cost.toString(),
      notes: item.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const parseExpense = (val) => {
    if (!val || val.trim() === '') return 0;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return 0;
    return num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const trip_name = formData.trip_name.trim();
    const destination = formData.destination.trim();
    const start_date = formData.start_date;
    const end_date = formData.end_date;
    
    if (!trip_name || !destination || !start_date) {
      setFormError('Trip Name, Destination, and Start Date are required.');
      return;
    }

    if (end_date && end_date < start_date) {
      setFormError('End Date must be on or after Start Date.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      trip_name,
      destination,
      category: formData.category,
      start_date,
      end_date: end_date || null,
      fuel_cost: parseExpense(formData.fuel_cost),
      food_cost: parseExpense(formData.food_cost),
      stay_cost: parseExpense(formData.stay_cost),
      other_cost: parseExpense(formData.other_cost),
      notes: formData.notes.trim() || null
    };

    let result;
    if (editingItem) {
      result = await editTrip(editingItem.id, dataToSave);
    } else {
      result = await addTrip(dataToSave);
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
    const result = await removeTrip(itemToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  if (itemsLoading) return <LoadingState message="Loading trips..." />;
  if (itemsError) return <ErrorState title="Failed to load trips" message={itemsError} onRetry={refreshTrips} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Annual Trips" 
          description="Plan trips, track travel expenses, and keep your yearly journeys organized." 
        />
        <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Trip
        </Button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 flex flex-col justify-center text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Trips</span>
          <span className="text-2xl font-bold text-gray-900">{totalTrips}</span>
        </div>
        <div className="bg-surface border border-border p-4 flex flex-col justify-center text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Expenses</span>
          <span className="text-2xl font-bold text-red-600">{formatCurrencyINR(totalExpenses)}</span>
        </div>
        <div className="bg-surface border border-border p-4 flex flex-col justify-center text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Upcoming</span>
          <span className="text-2xl font-bold text-gray-900">{upcomingCount}</span>
        </div>
        <div className="bg-surface border border-border p-4 flex flex-col justify-center text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Completed</span>
          <span className="text-2xl font-bold text-gray-900">{completedCount}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <Input 
            placeholder="Search trips..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-4 sm:shrink-0 w-full sm:w-auto">
          <Select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full sm:w-28 shrink-0"
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </Select>
          <Select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 shrink-0"
          >
            <option value="All Categories">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36 shrink-0"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </Select>
          <div className="text-sm text-gray-500 whitespace-nowrap text-right flex-1 sm:flex-none">
            {countFiltered} {countFiltered === 1 ? 'trip' : 'trips'}
          </div>
        </div>
      </div>

      {trips.length === 0 ? (
        <EmptyState 
           icon={Plane} 
           title="No trips added yet."
           description="Add your first trip to start tracking your journeys." 
           action={<Button onClick={openAddModal}>Add Trip</Button>}
         />
      ) : filteredItems.length === 0 ? (
        <EmptyState 
           icon={Search} 
           title="No trips match your current filters."
           description="Try changing your search, year, category, or status filter." 
         />
      ) : (
        <div className="overflow-x-auto bg-surface border border-border">
          <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/5">Trip & Destination</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/4">Dates</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-24">Duration</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/6">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right w-28">Total Cost</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-24 text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map(item => {
                const totalCost = calculateTotalCost(item);
                const status = getStatus(item.start_date, item.end_date);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 truncate max-w-[200px]" title={item.trip_name}>
                        {item.trip_name}
                      </div>
                      <div className="text-gray-500 text-xs truncate max-w-[200px]" title={item.destination}>
                        {item.destination}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateRange(item.start_date, item.end_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {calculateDuration(item.start_date, item.end_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-800 text-white border border-gray-900">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {totalCost > 0 ? formatCurrencyINR(totalCost) : '₹0'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold border ${
                        status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        status === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => openEditModal(item)}
                          title="Edit Trip"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => confirmDelete(item)}
                          title="Delete Trip"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Trip' : 'Add Trip'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name *</label>
              <Input
                value={formData.trip_name}
                onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                placeholder="e.g. Summer Vacation, AWS Summit"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Goa, Las Vegas"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isSubmitting}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Expenses (INR)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fuel</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fuel_cost}
                  onChange={(e) => setFormData({ ...formData, fuel_cost: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Food</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.food_cost}
                  onChange={(e) => setFormData({ ...formData, food_cost: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Stay</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stay_cost}
                  onChange={(e) => setFormData({ ...formData, stay_cost: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Other</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.other_cost}
                  onChange={(e) => setFormData({ ...formData, other_cost: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Itinerary summary, flight details, or memories..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Trip')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Trip"
        message={`Are you sure you want to delete "${itemToDelete?.trip_name}"?`}
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
