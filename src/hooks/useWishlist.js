import { useState, useEffect, useCallback } from 'react';
import {
  getWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem
} from '../services/wishlistService';

export function useWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlistItems();
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
      const newItem = await createWishlistItem(itemData);
      setItems(prev => [newItem, ...prev]);
      return { success: true, data: newItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editItem = async (id, itemData) => {
    try {
      const updatedItem = await updateWishlistItem(id, itemData);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return { success: true, data: updatedItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteWishlistItem(id);
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
