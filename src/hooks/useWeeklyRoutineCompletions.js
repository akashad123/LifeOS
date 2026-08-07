import { useState, useEffect, useCallback } from 'react';
import { getWeekStartDate } from '../utils/dateUtils';
import {
  getWeeklyRoutineCompletions,
  markWeeklyRoutineComplete,
  markWeeklyRoutineIncomplete
} from '../services/weeklyRoutineCompletionsService';

export function useWeeklyRoutineCompletions(initialDate = new Date()) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekStartDate(initialDate));
  const [completedRoutineIds, setCompletedRoutineIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  const fetchCompletions = useCallback(async (weekStart) => {
    try {
      setLoading(true);
      setError(null);
      const ids = await getWeeklyRoutineCompletions(weekStart);
      setCompletedRoutineIds(new Set(ids));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletions(selectedWeekStart);
  }, [selectedWeekStart, fetchCompletions]);

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
        await markWeeklyRoutineComplete(routineId, selectedWeekStart);
      } else {
        await markWeeklyRoutineIncomplete(routineId, selectedWeekStart);
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
    selectedWeekStart,
    setSelectedWeekStart,
    completedRoutineIds,
    loading,
    error,
    toggleCompletion,
    savingIds,
    refresh: () => fetchCompletions(selectedWeekStart)
  };
}
