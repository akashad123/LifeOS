import React, { useState } from 'react';
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
import { Calendar, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWeeklyRoutines } from '../../hooks/useWeeklyRoutines';
import { useWeeklyRoutineCompletions } from '../../hooks/useWeeklyRoutineCompletions';
import { getWeekStartDate, formatWeekRange, addWeeks, getLocalIsoDate } from '../../utils/dateUtils';

export default function WeeklyRoutines() {
  const { 
    routines, 
    loading: routinesLoading, 
    error: routinesError, 
    addRoutine, 
    editRoutine, 
    removeRoutine, 
    refresh: refreshRoutines 
  } = useWeeklyRoutines();
  
  const {
    selectedWeekStart,
    setSelectedWeekStart,
    completedRoutineIds,
    loading: completionsLoading,
    error: completionsError,
    toggleCompletion,
    savingIds,
    refresh: refreshCompletions
  } = useWeeklyRoutineCompletions();

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeRoutines = routines.filter(r => r.is_active !== false);
  const currentWeekStart = getWeekStartDate(new Date());
  
  const navigateWeek = (direction) => {
    const newWeekStart = addWeeks(selectedWeekStart, direction);
    if (newWeekStart <= currentWeekStart) {
      setSelectedWeekStart(newWeekStart);
    }
  };

  const openAddModal = () => {
    setEditingRoutine(null);
    setFormData({ name: '', description: '', is_active: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (routine) => {
    setEditingRoutine(routine);
    setFormData({ 
      name: routine.name, 
      description: routine.description || '', 
      is_active: routine.is_active ?? true 
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
    
    const name = formData.name.trim();
    if (!name) {
      setFormError('Routine name is required.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      name,
      description: formData.description.trim() || null,
      is_active: formData.is_active
    };

    let result = editingRoutine 
      ? await editRoutine(editingRoutine.id, dataToSave)
      : await addRoutine(dataToSave);

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
  };

  const confirmDelete = (routine) => {
    setRoutineToDelete(routine);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!routineToDelete) return;
    setIsDeleting(true);
    const result = await removeRoutine(routineToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setRoutineToDelete(null);
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  if (routinesLoading) return <LoadingState message="Loading weekly routines..." />;
  if (routinesError) return <ErrorState title="Failed to load routines" message={routinesError} onRetry={refreshRoutines} />;

  return (
    <div className="space-y-12">
      {/* 
        ==================================================
        A. WEEKLY CHECKLIST 
        ==================================================
      */}
      <section className="space-y-6">
        <PageHeader 
          title="Weekly Routines" 
          description="Check off your active habits for the week." 
        />
        
        {/* Week Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border p-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigateWeek(-1)} className="px-2">
              <ChevronLeft size={18} />
            </Button>
            <div className="flex flex-1 sm:flex-none items-center justify-center gap-2 border border-border px-4 py-2 bg-background min-w-[160px]">
              <Calendar size={16} className="text-secondary" />
              <span className="text-sm font-medium text-primary">
                {formatWeekRange(selectedWeekStart)}
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigateWeek(1)} 
              disabled={selectedWeekStart === currentWeekStart}
              className="px-2"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
             {selectedWeekStart !== currentWeekStart ? (
               <Button variant="secondary" size="sm" onClick={() => setSelectedWeekStart(currentWeekStart)}>
                 This Week
               </Button>
             ) : <div className="hidden sm:block w-[72px]"></div>}
             <span className="text-sm font-medium text-secondary whitespace-nowrap">
               {completedRoutineIds.size} of {activeRoutines.length} completed
             </span>
          </div>
        </div>

        {/* Checklist Content */}
        {completionsError ? (
           <ErrorState title="Failed to load completions" message={completionsError} onRetry={refreshCompletions} />
        ) : completionsLoading ? (
           <LoadingState message="Loading checklist..." />
        ) : activeRoutines.length === 0 ? (
           <EmptyState 
             icon={Calendar} 
             title="No active weekly routines" 
             description={routines.length > 0 ? "You have routines, but none are active." : "Start building better habits by adding your first weekly routine below."} 
             action={<Button onClick={openAddModal}>Add Routine</Button>}
           />
        ) : (
           <div className="space-y-2">
             {activeRoutines.map(routine => {
               const isComplete = completedRoutineIds.has(routine.id);
               const isSaving = savingIds.has(routine.id);
               return (
                 <label 
                   key={routine.id}
                   className={`flex items-start gap-4 p-4 border border-border bg-surface transition-colors cursor-pointer hover:bg-gray-50 ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                 >
                   <div className="pt-0.5">
                     <input
                       type="checkbox"
                       checked={isComplete}
                       onChange={(e) => toggleCompletion(routine.id, e.target.checked)}
                       disabled={isSaving}
                       className="w-5 h-5 rounded-none border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                     />
                   </div>
                   <div className="flex flex-col w-full">
                     <span className={`font-medium ${isComplete ? 'line-through text-gray-400' : 'text-gray-900'} break-words`}>
                       {routine.name}
                     </span>
                     {routine.description && (
                       <span className={`text-sm ${isComplete ? 'line-through text-gray-300' : 'text-gray-500'} break-words mt-1`}>
                         {routine.description}
                       </span>
                     )}
                   </div>
                 </label>
               );
             })}
           </div>
        )}
      </section>

      {/* 
        ==================================================
        B. MANAGE ROUTINES 
        ==================================================
      */}
      <section className="space-y-6 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">Manage Routines</h2>
            <p className="text-sm text-secondary mt-1">Add, edit, or deactivate your routine definitions.</p>
          </div>
          <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus size={18} />
            Add Routine
          </Button>
        </div>

        {routines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.map(routine => (
              <Card key={routine.id} className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 break-words line-clamp-2" title={routine.name}>
                      {routine.name}
                    </h3>
                    {routine.is_active === false && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 uppercase tracking-wider whitespace-nowrap">
                        Inactive
                      </span>
                    )}
                  </div>
                  {routine.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3 break-words">
                      {routine.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2" 
                    onClick={() => openEditModal(routine)}
                  >
                    <Pencil size={16} />
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2" 
                    onClick={() => confirmDelete(routine)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRoutine ? 'Edit Routine' : 'Add Routine'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <Input
            label="Routine Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Bedsheet Change"
            disabled={isSubmitting}
            autoFocus
          />
          
          <Textarea
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any helpful notes or details..."
            disabled={isSubmitting}
            rows={3}
          />
          
          {editingRoutine && (
             <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
               <input
                 type="checkbox"
                 checked={formData.is_active}
                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                 disabled={isSubmitting}
                 className="rounded-none border-gray-300 text-gray-900 focus:ring-gray-900"
               />
               Active Routine
             </label>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingRoutine ? 'Save Changes' : 'Add Routine')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Routine"
        message={`Delete "${routineToDelete?.name}"? This will also remove its saved weekly completion history.`}
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
