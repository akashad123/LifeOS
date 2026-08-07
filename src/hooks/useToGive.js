import { useState, useEffect, useCallback } from 'react';
import {
  getToGiveItems,
  createToGiveItem,
  updateToGiveItem,
  deleteToGiveItem
} from '../services/toGiveService';

export function useToGive() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getToGiveItems();
      setItems(data);
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
      const newItem = await createToGiveItem(itemData);
      setItems(prev => [newItem, ...prev]);
      return { success: true, data: newItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editItem = async (id, itemData) => {
    try {
      const updatedItem = await updateToGiveItem(id, itemData);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return { success: true, data: updatedItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteToGiveItem(id);
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
    refresh: fetchItems
  };
}
