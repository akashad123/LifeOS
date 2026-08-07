import React, { useState, useMemo, useRef, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';
import { useImportantNotes } from '../../hooks/useImportantNotes';

function ImportantNoteCard({ note, onEdit, onDelete, onView }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
      }
    };
    
    // Slight delay to ensure DOM layout is complete before measuring
    const timeoutId = setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [note.content]);

  return (
    <div className="border border-border bg-surface p-5 flex flex-col group h-[280px]">
      <h3 
        className="text-lg font-bold text-gray-900 break-words mb-3 line-clamp-2 shrink-0" 
        title={note.heading}
      >
        {note.heading}
      </h3>
      
      <div className="flex-1 min-h-0 mb-4 flex flex-col items-start">
        <div 
          ref={contentRef}
          className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-5 w-full"
        >
          {note.content}
        </div>
        
        {isOverflowing && (
          <button 
            onClick={() => onView(note)}
            className="text-primary hover:text-primary/80 text-sm font-medium mt-2 focus:outline-none transition-colors shrink-0"
          >
            Read more
          </button>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto shrink-0">
        <button 
          onClick={() => onEdit(note)}
          className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium focus:outline-none"
        >
          <Edit2 size={16} /> Edit
        </button>
        <button 
          onClick={() => onDelete(note)}
          className="text-gray-500 hover:text-danger transition-colors flex items-center gap-1 text-sm font-medium focus:outline-none"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function ImportantNotes() {
  const {
    notes,
    loading,
    error,
    createImportantNote,
    updateImportantNote,
    deleteImportantNote,
    refreshNotes
  } = useImportantNotes();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // View Modal State
  const [viewingItem, setViewingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ heading: '', content: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived filtered notes
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      note =>
        note.heading.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ heading: '', content: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingItem(note);
    setFormData({ heading: note.heading, content: note.content });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedHeading = formData.heading.trim();
    const trimmedContent = formData.content.trim();

    if (!trimmedHeading || !trimmedContent) {
      setFormError('Both heading and text are required.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = { heading: trimmedHeading, content: trimmedContent };

    let result;
    if (editingItem) {
      result = await updateImportantNote(editingItem.id, dataToSave);
    } else {
      result = await createImportantNote(dataToSave);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
  };

  const confirmDelete = (note) => {
    setItemToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const result = await deleteImportantNote(itemToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(`Failed to delete note: ${result.error}`);
    }
  };

  if (loading) return <LoadingState message="Loading important notes..." />;
  if (error) return <ErrorState title="Failed to load important notes" message={error} onRetry={refreshNotes} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Important Notes" 
          description="A persistent notebook for personal reference information." 
        />
        <Button onClick={openAddModal} className="shrink-0 flex items-center gap-2">
          <Plus size={18} /> Add Note
        </Button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search important notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-border bg-surface text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors rounded-none"
        />
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 border border-border bg-surface">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No important notes yet</h3>
          <p className="text-gray-500 mb-4 text-sm">Store small pieces of information you want to keep permanently.</p>
          <Button onClick={openAddModal}>
            Add Note
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 border border-border bg-surface text-gray-500">
          No notes match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <ImportantNoteCard 
              key={note.id} 
              note={note} 
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
        title={editingItem ? 'Edit Important Note' : 'Add Important Note'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm border bg-red-50 text-red-700 border-red-200 rounded-none">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading *</label>
            <Input
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              placeholder="e.g. WiFi Password, Lock Combination..."
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter note contents..."
              disabled={isSubmitting}
              rows={8}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={viewingItem ? viewingItem.heading : ''}
      >
        <div className="space-y-6">
          <div className="text-gray-800 whitespace-pre-wrap break-words text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            {viewingItem?.content}
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setViewingItem(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Important Note"
        message={`Are you sure you want to delete "${itemToDelete?.heading}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
}
