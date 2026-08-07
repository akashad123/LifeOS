import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel', 
  isDanger = false,
  isLoading = false 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-6">
        <p className="text-secondary">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={isDanger ? 'danger' : 'primary'} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
