import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { LayoutDashboard, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToGet } from '../../hooks/useToGet';
import { formatCurrencyINR } from '../../utils/currencyUtils';

export default function ToGet() {
  const { 
    items, 
    loading: itemsLoading, 
    error: itemsError, 
    addItem, 
    editItem, 
    removeItem, 
    refreshItems 
  } = useToGet();

  const totalToGet = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingTotal = items.filter(i => i.status === 'Pending').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const receivedTotal = items.filter(i => i.status === 'Received').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    person_name: '', 
    amount: '', 
    reason: '', 
    expected_date: '',
    status: 'Pending',
    notes: ''
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
      person_name: '', 
      amount: '', 
      reason: '', 
      expected_date: '',
      status: 'Pending',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      person_name: item.person_name, 
      amount: item.amount, 
      reason: item.reason || '', 
      expected_date: item.expected_date || '',
      status: item.status || 'Pending',
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
    
    const person_name = formData.person_name.trim();
    if (!person_name) {
      setFormError('Person name is required.');
      return;
    }
    
    let parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setFormError('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      person_name,
      amount: parsedAmount,
      reason: formData.reason.trim() || null,
      expected_date: formData.expected_date || null,
      status: formData.status || 'Pending',
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
    } else {
      alert(`Failed to delete: ${result.error}`); 
    }
  };

  if (itemsLoading) return <LoadingState message="Loading items..." />;
  if (itemsError) return <ErrorState title="Failed to load items" message={itemsError} onRetry={refreshItems} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="To Get (Receivables)" 
          description="Keep track of money or items you need to receive from others." 
        />
        <Button onClick={openAddModal} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface border border-border p-4 text-sm">
        <div>
          <div className="text-gray-500 font-medium mb-1">Total To Get</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrencyINR(totalToGet)}</div>
        </div>
        <div>
          <div className="text-gray-500 font-medium mb-1">Pending</div>
          <div className="text-xl font-bold text-orange-600">{formatCurrencyINR(pendingTotal)}</div>
        </div>
        <div>
          <div className="text-gray-500 font-medium mb-1">Received</div>
          <div className="text-xl font-bold text-green-600">{formatCurrencyINR(receivedTotal)}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState 
           icon={LayoutDashboard} 
           title="Nothing to receive yet." 
           description="Add money or items that others owe you." 
           action={<Button onClick={openAddModal}>Add Item</Button>}
         />
      ) : (
        <div className="overflow-x-auto bg-surface border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">From</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Reason</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Expected Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-bold text-gray-900 ${item.status === 'Received' ? 'line-through text-gray-500' : ''}`}>
                        {item.person_name}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-gray-500 mt-1 break-words max-w-xs line-clamp-2">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary font-medium">
                    {formatCurrencyINR(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {item.reason || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.expected_date || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 uppercase tracking-wider whitespace-nowrap ${
                      item.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status}
                    </span>
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
        title={editingItem ? 'Edit To Get Item' : 'Add To Get Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From / Person Name *</label>
            <Input
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              placeholder="e.g. John Doe"
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
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 500"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Movie tickets"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date (Optional)</label>
              <Input
                type="date"
                value={formData.expected_date}
                onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

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
        message={`Delete record for "${itemToDelete?.person_name}"?`}
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
