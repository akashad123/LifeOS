import { useState, useEffect, useCallback } from 'react';
import {
  getCredentials,
  createCredential,
  updateCredential,
  deleteCredential
} from '../services/credentialsService';

export function useCredentials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCredentials();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData) => {
    try {
      const newItem = await createCredential(itemData);
      setItems(prev => [newItem, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editItem = async (id, itemData) => {
    try {
      const updatedItem = await updateCredential(id, itemData);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteCredential(id);
      setItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refreshItems: fetchItems
  };
}
