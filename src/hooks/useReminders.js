import { useState, useEffect, useCallback } from 'react';
import { 
  getReminders, 
  createReminder, 
  updateReminder, 
  deleteReminder 
} from '../services/remindersService';

export function useReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReminders();
      setReminders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleCreateReminder = async (reminderData) => {
    try {
      const newReminder = await createReminder(reminderData);
      setReminders(prev => [...prev, newReminder]);
      return { success: true, data: newReminder };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleUpdateReminder = async (id, reminderData) => {
    try {
      const updatedReminder = await updateReminder(id, reminderData);
      setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      return { success: true, data: updatedReminder };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    reminders,
    loading,
    error,
    createReminder: handleCreateReminder,
    updateReminder: handleUpdateReminder,
    deleteReminder: handleDeleteReminder,
    refreshReminders: fetchReminders
  };
}
