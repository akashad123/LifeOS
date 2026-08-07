import { useState, useEffect, useCallback } from 'react';
import { getLocalIsoDate } from '../utils/dateUtils';
import {
  getDailyOutfitsByDate,
  createDailyOutfit,
  updateDailyOutfit,
  deleteDailyOutfit
} from '../services/dailyOutfitsService';

export function useDailyOutfits(initialDate = getLocalIsoDate()) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOutfits = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyOutfitsByDate(date);
      setOutfits(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits(selectedDate);
  }, [selectedDate, fetchOutfits]);

  const addOutfit = async (outfitData) => {
    try {
      const savedOutfit = await createDailyOutfit({ ...outfitData, worn_date: selectedDate });
      setOutfits(prev => [...prev, savedOutfit]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editOutfit = async (id, outfitData) => {
    try {
      const savedOutfit = await updateDailyOutfit(id, outfitData);
      setOutfits(prev => prev.map(o => o.id === id ? savedOutfit : o));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeOutfit = async (id) => {
    try {
      await deleteDailyOutfit(id);
      setOutfits(prev => prev.filter(o => o.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    outfits,
    loading,
    error,
    addOutfit,
    editOutfit,
    removeOutfit,
    refresh: () => fetchOutfits(selectedDate)
  };
}
