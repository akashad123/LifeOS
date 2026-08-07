import { useState, useEffect, useCallback } from 'react';
import { getLocalIsoDate } from '../utils/dateUtils';
import {
  getDailyRoutineCompletions,
  markDailyRoutineComplete,
  markDailyRoutineIncomplete
} from '../services/dailyRoutineCompletionsService';

export function useDailyRoutineCompletions(initialDate = getLocalIsoDate()) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [completedRoutineIds, setCompletedRoutineIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  const fetchCompletions = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const ids = await getDailyRoutineCompletions(date);
      setCompletedRoutineIds(new Set(ids));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletions(selectedDate);
  }, [selectedDate, fetchCompletions]);

  const toggleCompletion = async (routineId, isComplete) => {
    if (savingIds.has(routineId)) return;
    
    // Optimistic update
    const previousState = new Set(completedRoutineIds);
    const nextState = new Set(previousState);
    if (isComplete) {
      nextState.add(routineId);
    } else {
      nextState.delete(routineId);
    }
    setCompletedRoutineIds(nextState);

    // Save
    setSavingIds(prev => {
      const next = new Set(prev);
      next.add(routineId);
      return next;
    });

    try {
      if (isComplete) {
        await markDailyRoutineComplete(routineId, selectedDate);
      } else {
        await markDailyRoutineIncomplete(routineId, selectedDate);
      }
    } catch (err) {
      // Rollback
      setCompletedRoutineIds(previousState);
      alert(err.message);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(routineId);
        return next;
      });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    completedRoutineIds,
    loading,
    error,
    toggleCompletion,
    savingIds,
    refresh: () => fetchCompletions(selectedDate)
  };
}
