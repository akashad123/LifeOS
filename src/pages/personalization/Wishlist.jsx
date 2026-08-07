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
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Gift, Plus, Pencil, Trash2 } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCurrencyINR } from '../../utils/currencyUtils';

export default function Wishlist() {
  const { 
    items, 
    loading: itemsLoading, 
    error: itemsError, 
    addItem, 
    editItem, 
    removeItem, 
    refresh: refreshItems 
  } = useWishlist();

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    estimated_price: '', 
    priority: 'Medium', 
    notes: '',
    is_purchased: false,
    purchased_date: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      name: '', 
      estimated_price: '', 
      priority: 'Medium', 
      notes: '',
      is_purchased: false,
      purchased_date: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, 
      estimated_price: item.estimated_price || '', 
      priority: item.priority || 'Medium', 
      notes: item.notes || '',
      is_purchased: item.is_purchased || false,
      purchased_date: item.purchased_date || ''
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
      setFormError('Item name is required.');
      return;
    }
    
    let parsedPrice = null;
    if (formData.estimated_price !== '') {
      parsedPrice = parseFloat(formData.estimated_price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setFormError('Estimated price must be a valid positive number.');
        return;
      }
    }

    setIsSubmitting(true);
    const dataToSave = {
      name,
      estimated_price: parsedPrice,
      priority: formData.priority || null,
      notes: formData.notes.trim() || null,
      is_purchased: formData.is_purchased,
      purchased_date: (formData.is_purchased && formData.purchased_date) ? formData.purchased_date : null
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
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  if (itemsLoading) return <LoadingState message="Loading wishlist..." />;
  if (itemsError) return <ErrorState title="Failed to load wishlist" message={itemsError} onRetry={refreshItems} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Wishlist / Dreams" 
          description="Keep track of things you want to buy or achieve in the future." 
        />
        <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState 
           icon={Gift} 
           title="Your wishlist is empty." 
           description="Start adding things you want to buy or achieve in the future." 
           action={<Button onClick={openAddModal}>Add Item</Button>}
         />
      ) : (
        <div className="overflow-x-auto bg-surface border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Item</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Estimated Price</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Priority</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Purchased Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-bold text-gray-900 ${item.is_purchased ? 'line-through text-gray-500' : ''}`}>
                        {item.name}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-gray-500 mt-1 break-words max-w-xs line-clamp-2">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary font-medium">
                    {item.estimated_price !== null ? formatCurrencyINR(item.estimated_price) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.priority && (
                      <span className={`text-[10px] px-2 py-1 uppercase tracking-wider whitespace-nowrap ${
                        item.priority === 'High' ? 'bg-danger/10 text-danger' : 
                        item.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.is_purchased ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 uppercase tracking-wider whitespace-nowrap">
                        Purchased
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 uppercase tracking-wider whitespace-nowrap">
                        Wanted
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.is_purchased && item.purchased_date ? item.purchased_date : '-'}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Wishlist Item' : 'Add Wishlist Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. New Laptop"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_price}
                onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                placeholder="e.g. 1200.00"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Optional)</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Links, models, or any helpful details..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          {editingItem && (
             <div className="p-4 border border-border bg-gray-50 flex flex-col gap-3">
               <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={formData.is_purchased}
                   onChange={(e) => setFormData({ ...formData, is_purchased: e.target.checked })}
                   disabled={isSubmitting}
                   className="w-4 h-4 rounded-none border-gray-300 text-gray-900 focus:ring-gray-900"
                 />
                 Mark as Purchased
               </label>
               
               {formData.is_purchased && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Date</label>
                   <Input
                     type="date"
                     value={formData.purchased_date}
                     onChange={(e) => setFormData({ ...formData, purchased_date: e.target.value })}
                     disabled={isSubmitting}
                   />
                 </div>
               )}
             </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Item')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Item"
        message={`Delete "${itemToDelete?.name}" from your wishlist?`}
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
