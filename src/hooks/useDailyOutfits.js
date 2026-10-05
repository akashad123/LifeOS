import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllDailyOutfits,
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

/**
 * useDailyOutfits Hook
 * Manages full lifecycle and state for Daily Outfits across months and historical dates.
 */
export function useDailyOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all historical and current outfit records
  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDailyOutfits();
      setOutfits(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  // Derive unique autocomplete suggestions dynamically from all recorded outfits
  const suggestions = useMemo(() => ({
    tops: extractUniqueValues(outfits, 'top'),
    bottoms: extractUniqueValues(outfits, 'bottom'),
    footwears: extractUniqueValues(outfits, 'footwear')
  }), [outfits]);

  const addOutfit = async (outfitData) => {
    try {
      const savedOutfit = await createDailyOutfit(outfitData);
      setOutfits(prev => {
        const updated = [savedOutfit, ...prev];
        updated.sort((a, b) => new Date(b.worn_date) - new Date(a.worn_date));
        return updated;
      });
      return { success: true, data: savedOutfit };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editOutfit = async (id, outfitData) => {
    try {
      const savedOutfit = await updateDailyOutfit(id, outfitData);
      setOutfits(prev => {
        const updated = prev.map(o => o.id === id ? savedOutfit : o);
        updated.sort((a, b) => new Date(b.worn_date) - new Date(a.worn_date));
        return updated;
      });
      return { success: true, data: savedOutfit };
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
    outfits,
    suggestions,
    loading,
    error,
    addOutfit,
    editOutfit,
    removeOutfit,
    refresh: fetchOutfits
  };
}
