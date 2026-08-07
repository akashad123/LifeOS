import { useState, useEffect, useCallback } from 'react';
import {
  getDailyRoutines,
  createDailyRoutine,
  updateDailyRoutine,
  deleteDailyRoutine
} from '../services/dailyRoutinesService';

export function useDailyRoutines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyRoutines();
      setRoutines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const addRoutine = async (routineData) => {
    try {
      const newRoutine = await createDailyRoutine(routineData);
      setRoutines((prev) => [newRoutine, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editRoutine = async (id, updates) => {
    try {
      const updatedRoutine = await updateDailyRoutine(id, updates);
      setRoutines((prev) =>
        prev.map((r) => (r.id === id ? updatedRoutine : r))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeRoutine = async (id) => {
    try {
      await deleteDailyRoutine(id);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    routines,
    loading,
    error,
    addRoutine,
    editRoutine,
    removeRoutine,
    refresh: fetchRoutines
  };
}
