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
import { Key, Plus, Pencil, Trash2, Eye, EyeOff, Copy, Search } from 'lucide-react';
import { useCredentials } from '../../hooks/useCredentials';

const CATEGORIES = [
  'Personal',
  'Professional',
  'Study / Education',
  'Banking & Finance',
  'Railway & Travel',
  'Government',
  'Shopping',
  'Social Media',
  'Entertainment',
  'Gaming',
  'Cloud & Hosting',
  'Development',
  'Work Tools',
  'IT & Devices',
  'Communication',
  'Email',
  'Parents / Family',
  'Health & Insurance',
  'Utilities & Bills',
  'Other'
];

export default function Credentials() {
  const { 
    items, 
    loading: itemsLoading, 
    error: itemsError, 
    addItem, 
    editItem, 
    removeItem, 
    refreshItems 
  } = useCredentials();

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    app_name: '', 
    username_email: '', 
    encrypted_password: '',
    category: 'Personal',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Visibility State
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // Filter State
  const [filter, setFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived state
  const filteredItems = items.filter(item => {
    // 1. Category check
    const matchesCategory = filter === 'All Categories' || item.category === filter;
    if (!matchesCategory) return false;

    // 2. Search check
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    
    // Explicitly exclude encrypted_password from search
    return (
      (item.app_name?.toLowerCase().includes(q)) ||
      (item.username_email?.toLowerCase().includes(q)) ||
      (item.category?.toLowerCase().includes(q)) ||
      (item.notes?.toLowerCase().includes(q))
    );
  });

  const countFiltered = filteredItems.length;

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      app_name: '', 
      username_email: '', 
      encrypted_password: '',
      category: 'Personal',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      app_name: item.app_name, 
      username_email: item.username_email, 
      encrypted_password: item.encrypted_password || '',
      category: item.category || 'Personal',
      notes: item.notes || ''
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
    
    const app_name = formData.app_name.trim();
    const username_email = formData.username_email.trim();
    
    if (!app_name || !username_email) {
      setFormError('App / Service Name and Username / Email are required.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      app_name,
      username_email,
      encrypted_password: formData.encrypted_password || null,
      category: formData.category,
      notes: formData.notes.trim() || null
    };

    let result = editingItem 
      ? await editItem(editingItem.id, dataToSave)
      : await addItem(dataToSave);

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
    const result = await removeItem(itemToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      // Clean up visibility set if deleted item was visible
      setVisiblePasswords(prev => {
        const next = new Set(prev);
        next.delete(itemToDelete.id);
        return next;
      });
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  if (itemsLoading) return <LoadingState message="Loading credentials..." />;
  if (itemsError) return <ErrorState title="Failed to load credentials" message={itemsError} onRetry={refreshItems} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Credentials" 
          description="Store and manage your account login details." 
        />
        <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Credential
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <Input 
            placeholder="Search credentials..." 
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
            {countFiltered} {countFiltered === 1 ? 'credential' : 'credentials'}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState 
           icon={Key} 
           title="No credentials saved yet."
           description="Add your first credential to keep your logins organized." 
           action={<Button onClick={openAddModal}>Add Credential</Button>}
         />
      ) : filteredItems.length === 0 ? (
        <EmptyState 
           icon={Key} 
           title="No credentials found."
           description="Try changing your search or category filter." 
         />
      ) : (
        <div className="overflow-x-auto bg-surface border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">App / Service</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Username / Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Password</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map(item => {
                const isVisible = visiblePasswords.has(item.id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 break-words">
                      {item.app_name}
                    </td>
                    <td className="px-4 py-3 text-primary break-words">
                      {item.username_email}
                    </td>
                    <td className="px-4 py-3">
                      {item.encrypted_password ? (
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-800 tracking-wider">
                            {isVisible ? item.encrypted_password : '••••••••'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                              title={isVisible ? "Hide Password" : "Show Password"}
                            >
                              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button 
                              onClick={() => copyToClipboard(item.encrypted_password)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                              title="Copy Password"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No password</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-800 text-white border border-gray-900 whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs break-words line-clamp-2">
                      {item.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="p-2" 
                          onClick={() => confirmDelete(item)}
                          title="Delete"
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

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Credential' : 'Add Credential'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App / Service Name *</label>
              <Input
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                placeholder="e.g. Google"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email *</label>
              <Input
                value={formData.username_email}
                onChange={(e) => setFormData({ ...formData, username_email: e.target.value })}
                placeholder="e.g. example@gmail.com"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="text"
                value={formData.encrypted_password}
                onChange={(e) => setFormData({ ...formData, encrypted_password: e.target.value })}
                placeholder="Leave blank if not needed"
                disabled={isSubmitting}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details, security questions, or URLs..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Credential')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Credential"
        message={`Are you sure you want to delete the credential for "${itemToDelete?.app_name}"?`}
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
