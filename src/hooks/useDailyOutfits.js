import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLocalIsoDate } from '../utils/dateUtils';
import {
  getDailyOutfitsByDate,
  getDailyOutfitSuggestions,
  createDailyOutfit,
  updateDailyOutfit,
  deleteDailyOutfit
} from '../services/dailyOutfitsService';

/**
 * Extracts unique non-empty string values for a specific field,
 * deduplicating case-insensitively while preserving original display casing
 * and chronological order.
 */
function extractUniqueValues(records, field) {
  const seen = new Set();
  const unique = [];

  for (const record of records) {
    const rawVal = record?.[field];
    if (typeof rawVal === 'string') {
      const trimmed = rawVal.trim();
      if (trimmed.length > 0) {
        const normalized = trimmed.toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          unique.push(trimmed);
        }
      }
    }
  }

  return unique;
}

export function useDailyOutfits(initialDate = getLocalIsoDate()) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [outfits, setOutfits] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch outfits for the specific selected date
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

  // Fetch all historical outfit records for autocomplete suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await getDailyOutfitSuggestions();
      setHistoryRecords(data || []);
    } catch (err) {
      // Non-blocking: log error without breaking page load
      console.error('Failed to load outfit suggestions:', err);
    }
  }, []);

  useEffect(() => {
    fetchOutfits(selectedDate);
  }, [selectedDate, fetchOutfits]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Derive unique suggestions for tops, bottoms, and footwears
  const suggestions = useMemo(() => ({
    tops: extractUniqueValues(historyRecords, 'top'),
    bottoms: extractUniqueValues(historyRecords, 'bottom'),
    footwears: extractUniqueValues(historyRecords, 'footwear')
  }), [historyRecords]);

  const addOutfit = async (outfitData) => {
    try {
      const savedOutfit = await createDailyOutfit({ ...outfitData, worn_date: selectedDate });
      setOutfits(prev => [...prev, savedOutfit]);
      // Instantly make the newly saved values available as suggestions without a refetch
      setHistoryRecords(prev => [
        { top: savedOutfit.top, bottom: savedOutfit.bottom, footwear: savedOutfit.footwear },
        ...prev
      ]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editOutfit = async (id, outfitData) => {
    try {
      const savedOutfit = await updateDailyOutfit(id, outfitData);
      setOutfits(prev => prev.map(o => o.id === id ? savedOutfit : o));
      // Instantly incorporate updated values into suggestions
      setHistoryRecords(prev => [
        { top: savedOutfit.top, bottom: savedOutfit.bottom, footwear: savedOutfit.footwear },
        ...prev
      ]);
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
    suggestions,
    loading,
    error,
    addOutfit,
    editOutfit,
    removeOutfit,
    refresh: () => fetchOutfits(selectedDate),
    refreshSuggestions: fetchSuggestions
  };
}
