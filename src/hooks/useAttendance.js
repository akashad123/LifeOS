import { useState, useEffect, useCallback } from 'react';
import {
  getAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord
} from '../services/attendanceService';

export function useAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAttendanceRecords();
      setRecords(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (recordData) => {
    try {
      const newRecord = await createAttendanceRecord(recordData);
      setRecords(prev => {
        const newArray = [...prev, newRecord];
        return newArray.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      });
      return { success: true, data: newRecord };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editRecord = async (id, recordData) => {
    try {
      const updatedRecord = await updateAttendanceRecord(id, recordData);
      setRecords(prev => {
        const newArray = prev.map(r => r.id === id ? updatedRecord : r);
        return newArray.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      });
      return { success: true, data: updatedRecord };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeRecord = async (id) => {
    try {
      await deleteAttendanceRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    editRecord,
    removeRecord,
    refreshRecords: fetchRecords
  };
}
