import React, { useState } from 'react';
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
import { LayoutDashboard, Plus, Pencil, Trash2, Search, Download } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';

const CATEGORIES = [
  'Identity & Government',
  'Education',
  'Professional & Employment',
  'Banking & Finance',
  'Health & Insurance',
  'Vehicle',
  'Property',
  'Travel',
  'Bills & Receipts',
  'Certificates',
  'Other'
];

export default function Documents() {
  const { 
    documents, 
    loading: itemsLoading, 
    error: itemsError, 
    addDocument, 
    editDocument, 
    removeDocument,
    getSignedUrl,
    refreshDocuments 
  } = useDocuments();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    document_name: '', 
    category: 'Identity & Government',
    expiry_date: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [filter, setFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived state for filtering
  const filteredItems = documents.filter(item => {
    // 1. Category check
    const matchesCategory = filter === 'All Categories' || item.category === filter;
    if (!matchesCategory) return false;

    // 2. Search check
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    
    return (
      (item.document_name?.toLowerCase().includes(q)) ||
      (item.category?.toLowerCase().includes(q)) ||
      (item.notes?.toLowerCase().includes(q))
    );
  });

  const countFiltered = filteredItems.length;

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      document_name: '', 
      category: 'Identity & Government',
      expiry_date: '',
      notes: ''
    });
    setSelectedFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      document_name: item.document_name, 
      category: item.category || 'Identity & Government',
      expiry_date: item.expiry_date || '',
      notes: item.notes || ''
    });
    setSelectedFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e) => {
    setFormError('');
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 1 MB limit
    if (file.size > 1024 * 1024) {
      setFormError('File must be 1 MB or smaller.');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      setFormError('Unsupported file type.');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const document_name = formData.document_name.trim();
    
    if (!document_name) {
      setFormError('Document Name is required.');
      return;
    }

    if (!editingItem && !selectedFile) {
      setFormError('File is required when adding a new document.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      document_name,
      category: formData.category,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes.trim() || null
    };

    let result;
    if (editingItem) {
      result = await editDocument(editingItem.id, dataToSave);
    } else {
      result = await addDocument(dataToSave, selectedFile);
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
    const result = await removeDocument(itemToDelete);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  const handleDownload = async (item) => {
    if (!item.file_path) {
      alert("No file path found for this document.");
      return;
    }
    
    const result = await getSignedUrl(item.file_path);
    if (result.success && result.url) {
      // Open in a new tab or trigger download
      window.open(result.url, '_blank');
    } else {
      alert(`Failed to access document: ${result.error}`);
    }
  };

  if (itemsLoading) return <LoadingState message="Loading documents..." />;
  if (itemsError) return <ErrorState title="Failed to load documents" message={itemsError} onRetry={refreshDocuments} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Documents" 
          description="Store and manage your important personal documents securely." 
        />
        <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Document
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-row items-center justify-between sm:justify-start gap-4 sm:shrink-0 w-full sm:w-auto">
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-48 shrink-0"
          >
            <option value="All Categories">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <div className="text-sm text-gray-500 whitespace-nowrap text-right flex-1 sm:flex-none">
            {countFiltered} {countFiltered === 1 ? 'document' : 'documents'}
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <EmptyState 
           icon={LayoutDashboard} 
           title="No documents added yet."
           description="Add your first document to keep your files organized." 
           action={<Button onClick={openAddModal}>Add Document</Button>}
         />
      ) : filteredItems.length === 0 ? (
        <EmptyState 
           icon={Search} 
           title="No documents match your current filters."
           description="Try changing your search or category filter." 
         />
      ) : (
        <div className="overflow-x-auto bg-surface border border-border">
          <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/4">Document Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/6">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-1/6">Expiry Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900 truncate max-w-[200px]" title={item.document_name}>
                    {item.document_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-800 text-white border border-gray-900">
                      {item.category || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate" title={item.notes}>
                    {item.notes || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="p-2" 
                        onClick={() => handleDownload(item)}
                        title="View / Download"
                      >
                        <Download size={14} />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="p-2" 
                        onClick={() => openEditModal(item)}
                        title="Edit Metadata"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="p-2" 
                        onClick={() => confirmDelete(item)}
                        title="Delete Document"
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
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Document' : 'Add Document'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
              <Input
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="e.g. Passport, Tax Return 2023"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            {!editingItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <label 
                  htmlFor="file-upload"
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed hover:border-gray-400 bg-white cursor-pointer relative transition-colors block w-full"
                >
                  <div className="space-y-1 text-center w-full">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-white rounded-none font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        {selectedFile ? (
                          <div className="flex flex-col items-center">
                            <span className="text-gray-500 font-normal mb-1">Selected file</span>
                            <span className="font-bold text-gray-900 break-all">{selectedFile.name}</span>
                          </div>
                        ) : 'Upload a file'}
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isSubmitting} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
                      </span>
                    </div>
                    {!selectedFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, JPG, PNG, DOC, DOCX or XLSX — maximum 1 MB.
                      </p>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details or context..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Document')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${itemToDelete?.document_name}"? This action cannot be undone and will permanently remove the file from storage.`}
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
