import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AutocompleteInput from '../../components/ui/AutocompleteInput';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { 
  Shirt, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Tag, 
  Footprints,
  CalendarDays,
  X
} from 'lucide-react';
import { useDailyOutfits } from '../../hooks/useDailyOutfits';
import { getLocalIsoDate, parseLocalDate } from '../../utils/dateUtils';

/**
 * Calculates the most frequently occurring item in an array of records
 */
function getMostFrequentItem(items, key) {
  if (!items || items.length === 0) return null;
  const counts = {};
  let maxCount = 0;
  let topItem = null;

  for (const item of items) {
    const val = item[key]?.trim();
    if (!val) continue;
    const normalized = val.toLowerCase();
    counts[normalized] = counts[normalized] || { name: val, count: 0 };
    counts[normalized].count += 1;
    if (counts[normalized].count > maxCount) {
      maxCount = counts[normalized].count;
      topItem = counts[normalized];
    }
  }

  return topItem;
}

/**
 * Returns human-readable relative day text (e.g. Today, Yesterday, or X days ago)
 */
function getRelativeDateLabel(dateStr, todayIso) {
  if (dateStr === todayIso) return 'Today';
  
  const targetDate = parseLocalDate(dateStr);
  const todayDate = parseLocalDate(todayIso);
  const diffTime = todayDate.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 30) return `${diffDays}d ago`;
  if (diffDays < -1) return `In ${Math.abs(diffDays)}d`;
  return null;
}

export default function DailyOutfits() {
  const todayIso = getLocalIsoDate();
  const { 
    outfits, 
    suggestions, 
    loading, 
    error, 
    addOutfit, 
    editOutfit, 
    removeOutfit, 
    refresh 
  } = useDailyOutfits();

  // Navigation and Filter States
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'past30' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState(null);
  const [formData, setFormData] = useState({
    worn_date: todayIso,
    top: '',
    bottom: '',
    footwear: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Month navigation handlers
  const prevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setFilterMode('month');
  };

  const nextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setFilterMode('month');
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setFilterMode('month');
  };

  const monthYearLabel = currentMonthDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Filter outfits based on selected mode, date, and search query
  const filteredOutfits = useMemo(() => {
    let result = outfits;

    // Filter by Timeframe
    if (filterMode === 'month') {
      const year = currentMonthDate.getFullYear();
      const month = currentMonthDate.getMonth();
      result = result.filter(o => {
        const d = parseLocalDate(o.worn_date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    } else if (filterMode === 'past30') {
      const todayDate = parseLocalDate(todayIso);
      const thirtyDaysAgo = new Date(todayDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      result = result.filter(o => {
        const d = parseLocalDate(o.worn_date);
        return d >= thirtyDaysAgo && d <= todayDate;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.top?.toLowerCase().includes(q) ||
        o.bottom?.toLowerCase().includes(q) ||
        o.footwear?.toLowerCase().includes(q) ||
        o.notes?.toLowerCase().includes(q) ||
        o.worn_date?.includes(q)
      );
    }

    // Ensure sorted chronologically descending
    return [...result].sort((a, b) => new Date(b.worn_date) - new Date(a.worn_date));
  }, [outfits, filterMode, currentMonthDate, todayIso, searchQuery]);

  // At a glance metrics for the active filtered outfits
  const metrics = useMemo(() => {
    const totalOutfits = filteredOutfits.length;
    const uniqueDates = new Set(filteredOutfits.map(o => o.worn_date)).size;
    const mostWornTop = getMostFrequentItem(filteredOutfits, 'top');
    const mostWornBottom = getMostFrequentItem(filteredOutfits, 'bottom');
    const mostWornFootwear = getMostFrequentItem(filteredOutfits, 'footwear');

    return {
      totalOutfits,
      uniqueDates,
      mostWornTop,
      mostWornBottom,
      mostWornFootwear
    };
  }, [filteredOutfits]);

  // Modal open handlers
  const openAddModal = (presetDate = null) => {
    setFormData({
      worn_date: presetDate || todayIso,
      top: '',
      bottom: '',
      footwear: '',
      notes: ''
    });
    setFormError('');
    setEditingOutfitId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (outfit) => {
    setFormData({
      worn_date: outfit.worn_date,
      top: outfit.top,
      bottom: outfit.bottom,
      footwear: outfit.footwear || '',
      notes: outfit.notes || ''
    });
    setFormError('');
    setEditingOutfitId(outfit.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const top = formData.top.trim();
    const bottom = formData.bottom.trim();
    const worn_date = formData.worn_date;

    if (!worn_date) {
      setFormError('Date is required.');
      return;
    }

    if (!top || !bottom) {
      setFormError('Both Top and Bottom are required.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      worn_date,
      top,
      bottom,
      footwear: formData.footwear.trim() || null,
      notes: formData.notes.trim() || null
    };

    let result;
    if (editingOutfitId) {
      result = await editOutfit(editingOutfitId, dataToSave);
    } else {
      result = await addOutfit(dataToSave);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
  };

  const confirmDelete = (outfit) => {
    setOutfitToDelete(outfit);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!outfitToDelete) return;
    setIsDeleting(true);
    const result = await removeOutfit(outfitToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      setDeleteConfirmOpen(false);
      setOutfitToDelete(null);
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  const formatDateDisplay = (dateStr) => {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Daily Outfits" 
        description="See which dresses and outfits you wore at a glance, analyze your monthly wardrobe rotation, and plan your daily look."
        action={
          <Button onClick={() => openAddModal()} className="flex items-center gap-2">
            <Plus size={16} /> Log Outfit
          </Button>
        }
      />

      {/* At A Glance Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Outfits Logged */}
        <div className="bg-surface border border-border p-4">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Logged</span>
            <CalendarDays size={18} className="text-primary/70" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {metrics.totalOutfits}
            <span className="text-xs font-normal text-secondary ml-1">
              {metrics.totalOutfits === 1 ? 'outfit' : 'outfits'}
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Across {metrics.uniqueDates} {metrics.uniqueDates === 1 ? 'day' : 'days'}
          </p>
        </div>

        {/* Metric 2: Most Worn Top */}
        <div className="bg-surface border border-border p-4">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Most Worn Top</span>
            <Shirt size={18} className="text-primary/70" />
          </div>
          <div className="text-base font-bold text-gray-900 truncate" title={metrics.mostWornTop?.name || 'None recorded'}>
            {metrics.mostWornTop ? metrics.mostWornTop.name : '-'}
          </div>
          <p className="text-xs text-secondary mt-1">
            {metrics.mostWornTop ? `Worn ${metrics.mostWornTop.count} times in this period` : 'No data for this period'}
          </p>
        </div>

        {/* Metric 3: Most Worn Bottom */}
        <div className="bg-surface border border-border p-4">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Most Worn Bottom</span>
            <Tag size={18} className="text-primary/70" />
          </div>
          <div className="text-base font-bold text-gray-900 truncate" title={metrics.mostWornBottom?.name || 'None recorded'}>
            {metrics.mostWornBottom ? metrics.mostWornBottom.name : '-'}
          </div>
          <p className="text-xs text-secondary mt-1">
            {metrics.mostWornBottom ? `Worn ${metrics.mostWornBottom.count} times in this period` : 'No data for this period'}
          </p>
        </div>

        {/* Metric 4: Favorite Footwear */}
        <div className="bg-surface border border-border p-4">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold">Top Footwear</span>
            <Footprints size={18} className="text-primary/70" />
          </div>
          <div className="text-base font-bold text-gray-900 truncate" title={metrics.mostWornFootwear?.name || 'None recorded'}>
            {metrics.mostWornFootwear ? metrics.mostWornFootwear.name : '-'}
          </div>
          <p className="text-xs text-secondary mt-1">
            {metrics.mostWornFootwear ? `Worn ${metrics.mostWornFootwear.count} times in this period` : 'No data for this period'}
          </p>
        </div>
      </div>

      {/* Controls & Navigation Bar */}
      <div className="bg-surface border border-border p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={prevMonth} 
              className="px-2"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </Button>
            
            <div className="px-4 py-2 border border-border bg-background font-bold text-sm text-primary flex items-center gap-2 min-w-[170px] justify-center">
              <Calendar size={15} className="text-secondary" />
              <span>{filterMode === 'month' ? monthYearLabel : filterMode === 'past30' ? 'Past 30 Days' : 'All Time'}</span>
            </div>

            <Button 
              variant="outline" 
              onClick={nextMonth} 
              className="px-2"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </Button>

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={goToCurrentMonth}
              className="ml-1"
            >
              This Month
            </Button>
          </div>

          {/* Timeframe Scope Tabs */}
          <div className="flex items-center border border-border p-0.5 bg-background self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setFilterMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterMode === 'month' 
                  ? 'bg-primary text-white' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Selected Month
            </button>
            <button
              onClick={() => setFilterMode('past30')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterMode === 'past30' 
                  ? 'bg-primary text-white' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterMode === 'all' 
                  ? 'bg-primary text-white' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              All Outfits
            </button>
          </div>
        </div>

        {/* Live Search */}
        <div className="pt-3 border-t border-border">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search dress, top, bottom, footwear, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border text-sm text-primary placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Table List */}
      {error ? (
        <ErrorState title="Failed to load outfits" message={error} onRetry={refresh} />
      ) : loading ? (
        <LoadingState message="Loading your wardrobe history..." />
      ) : filteredOutfits.length === 0 ? (
        searchQuery ? (
          <div className="bg-surface border border-border p-12 text-center space-y-4">
            <Shirt className="w-12 h-12 text-secondary/40 mx-auto" />
            <h3 className="text-lg font-bold text-primary">No matching outfits found</h3>
            <p className="text-sm text-secondary max-w-sm mx-auto">
              No recorded dresses or outfits matched your search query "{searchQuery}".
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        ) : (
          <EmptyState 
            icon={Shirt} 
            title={
              filterMode === 'month' 
                ? `No outfits recorded for ${monthYearLabel}` 
                : filterMode === 'past30' 
                ? 'No outfits recorded in the past 30 days' 
                : 'No outfits recorded yet'
            } 
            description="Start logging your daily dress and outfit choices to build your wardrobe history and review what you wear at a glance." 
            action={
              <Button onClick={() => openAddModal()} className="flex items-center gap-2">
                <Plus size={16} /> Log First Outfit
              </Button>
            }
          />
        )
      ) : (
        /* Dedicated Table List View */
        <div className="bg-surface border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[180px]">Top / Upper Dress</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[180px]">Bottom / Lower</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[140px]">Footwear</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Notes / Occasion</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOutfits.map((outfit) => {
                  const relLabel = getRelativeDateLabel(outfit.worn_date, todayIso);
                  const isToday = outfit.worn_date === todayIso;

                  return (
                    <tr 
                      key={outfit.id} 
                      className={`hover:bg-gray-50/75 transition-colors ${
                        isToday ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Date & Day Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {formatDateDisplay(outfit.worn_date)}
                          </span>
                          {relLabel && (
                            <span 
                              className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider ${
                                isToday 
                                  ? 'bg-primary text-white' 
                                  : 'bg-secondary/15 text-secondary'
                              }`}
                            >
                              {relLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Top / Upper Column */}
                      <td className="px-4 py-3 font-semibold text-gray-900 break-words">
                        <div className="flex items-center gap-2">
                          <Shirt size={14} className="text-primary/60 shrink-0" />
                          <span>{outfit.top}</span>
                        </div>
                      </td>

                      {/* Bottom / Lower Column */}
                      <td className="px-4 py-3 font-medium text-gray-800 break-words">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-secondary/60 shrink-0" />
                          <span>{outfit.bottom}</span>
                        </div>
                      </td>

                      {/* Footwear Column */}
                      <td className="px-4 py-3 text-gray-700 break-words">
                        {outfit.footwear ? (
                          <div className="flex items-center gap-1.5">
                            <Footprints size={13} className="text-muted shrink-0" />
                            <span>{outfit.footwear}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Notes / Occasion Column */}
                      <td className="px-4 py-3 text-gray-600 break-words max-w-xs">
                        {outfit.notes ? (
                          <span className="line-clamp-2" title={outfit.notes}>
                            {outfit.notes}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="p-1.5" 
                            onClick={() => openEditModal(outfit)}
                            title="Edit Outfit"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="p-1.5" 
                            onClick={() => confirmDelete(outfit)}
                            title="Delete Outfit"
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

          {/* Table Footer Summary */}
          <div className="px-4 py-3 bg-gray-50/70 border-t border-border flex items-center justify-between text-xs text-secondary">
            <span>
              Showing <strong className="text-primary font-semibold">{filteredOutfits.length}</strong> {filteredOutfits.length === 1 ? 'outfit' : 'outfits'}
            </span>
            <span>
              Scope: <strong className="text-primary font-semibold">{filterMode === 'month' ? monthYearLabel : filterMode === 'past30' ? 'Past 30 Days' : 'All Time'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Outfit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOutfitId ? 'Edit Outfit' : 'Log Outfit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Date Worn *
            </label>
            <input
              type="date"
              value={formData.worn_date}
              onChange={(e) => setFormData({ ...formData, worn_date: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border text-sm text-primary focus:outline-none focus:border-primary"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Top / Upper with smart suggestions */}
          <AutocompleteInput
            label="Top / Upper Clothing *"
            value={formData.top}
            onChange={(e) => setFormData({ ...formData, top: e.target.value })}
            suggestions={suggestions?.tops || []}
            placeholder="e.g. Navy Oxford Shirt, White Linen Kurta, Zara T-Shirt..."
            disabled={isSubmitting}
            autoFocus
          />

          {/* Bottom / Lower with smart suggestions */}
          <AutocompleteInput
            label="Bottom / Lower Clothing *"
            value={formData.bottom}
            onChange={(e) => setFormData({ ...formData, bottom: e.target.value })}
            suggestions={suggestions?.bottoms || []}
            placeholder="e.g. Charcoal Chinos, Blue Denim Jeans, Formal Black Trousers..."
            disabled={isSubmitting}
          />

          {/* Footwear with smart suggestions */}
          <AutocompleteInput
            label="Footwear (Optional)"
            value={formData.footwear}
            onChange={(e) => setFormData({ ...formData, footwear: e.target.value })}
            suggestions={suggestions?.footwears || []}
            placeholder="e.g. White Sneakers, Tan Oxford Shoes, Black Loafers..."
            disabled={isSubmitting}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Notes / Occasion (Optional)
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Client presentation, casual friday, wedding reception..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={closeModal} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Outfit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Outfit Record"
        message={
          outfitToDelete 
            ? `Are you sure you want to delete the outfit worn on ${formatDateDisplay(outfitToDelete.worn_date)} (${outfitToDelete.top} / ${outfitToDelete.bottom})?` 
            : 'Are you sure you want to delete this outfit record?'
        }
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
