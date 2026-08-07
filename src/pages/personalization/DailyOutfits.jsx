import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Shirt, Calendar, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import { useDailyOutfits } from '../../hooks/useDailyOutfits';
import { getLocalIsoDate, parseLocalDate } from '../../utils/dateUtils';

export default function DailyOutfits() {
  const todayIso = getLocalIsoDate();
  const { 
    selectedDate, 
    setSelectedDate, 
    outfits, 
    loading: outfitLoading, 
    error: outfitError, 
    addOutfit,
    editOutfit, 
    removeOutfit, 
    refresh: refreshOutfit 
  } = useDailyOutfits(todayIso);

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ top: '', bottom: '', footwear: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState(null);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState(null);

  const navigateDate = (days) => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalIsoDate(d));
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  const openAddModal = () => {
    setFormData({ top: '', bottom: '', footwear: '', notes: '' });
    setFormError('');
    setEditingOutfitId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (outfit) => {
    setFormData({ 
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

    if (!top || !bottom) {
      setFormError('Top and Bottom are required.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
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

  // Derived display format for selected date
  const displayDate = () => {
    const d = parseLocalDate(selectedDate);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Daily Outfits" 
        description="Plan and keep track of what you wear each day." 
      />

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigateDate(-1)} className="px-2">
            <ChevronLeft size={18} />
          </Button>
          <div className="flex flex-1 sm:flex-none items-center justify-center gap-2 border border-border px-3 py-2 bg-background">
            <Calendar size={16} className="text-secondary" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-transparent text-primary outline-none text-sm w-full sm:w-auto"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigateDate(1)} 
            className="px-2"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            {selectedDate !== todayIso ? (
              <Button variant="secondary" size="sm" onClick={() => setSelectedDate(todayIso)}>
                Today
              </Button>
            ) : <div className="hidden sm:block w-16"></div>}
        </div>
      </div>

      {/* Main Content Area */}
      {outfitError ? (
         <ErrorState title="Failed to load outfits" message={outfitError} onRetry={refreshOutfit} />
      ) : outfitLoading ? (
         <LoadingState message="Loading outfits..." />
      ) : outfits.length === 0 ? (
         <EmptyState 
           icon={Shirt} 
           title="No outfit recorded for this date." 
           description="Add your planned or worn outfit to keep track of your wardrobe." 
           action={<Button onClick={openAddModal} className="flex items-center gap-2"><Plus size={16}/> Add Outfit</Button>}
         />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus size={16}/> Add Outfit
            </Button>
          </div>
          <div className="overflow-x-auto bg-surface border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[150px]">Top</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[150px]">Bottom</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 min-w-[120px]">Footwear</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {outfits.map(outfit => (
                  <tr key={outfit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {displayDate()}
                    </td>
                    <td className="px-4 py-3 text-primary font-medium break-words">
                      {outfit.top}
                    </td>
                    <td className="px-4 py-3 text-primary font-medium break-words">
                      {outfit.bottom}
                    </td>
                    <td className="px-4 py-3 text-gray-700 break-words">
                      {outfit.footwear || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 break-words max-w-xs line-clamp-2">
                      {outfit.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => openEditModal(outfit)}
                          title="Edit Outfit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => confirmDelete(outfit)}
                          title="Delete Outfit"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOutfitId ? 'Edit Outfit' : 'Add Outfit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <Input
            label="Top *"
            value={formData.top}
            onChange={(e) => setFormData({ ...formData, top: e.target.value })}
            placeholder="e.g. Blue check shirt"
            disabled={isSubmitting}
            autoFocus
          />
          
          <Input
            label="Bottom *"
            value={formData.bottom}
            onChange={(e) => setFormData({ ...formData, bottom: e.target.value })}
            placeholder="e.g. Black trousers"
            disabled={isSubmitting}
          />
          
          <Input
            label="Footwear (Optional)"
            value={formData.footwear}
            onChange={(e) => setFormData({ ...formData, footwear: e.target.value })}
            placeholder="e.g. Brown loafers"
            disabled={isSubmitting}
          />
          
          <Textarea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any helpful notes or details..."
            disabled={isSubmitting}
            rows={3}
          />
          
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Outfit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Outfit"
        message={`Are you sure you want to delete the outfit for ${displayDate()}?`}
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
