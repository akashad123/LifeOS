import { useState, useEffect, useCallback } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expensesService';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenses();
      setExpenses(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreateExpense = async (expenseData) => {
    try {
      const newExpense = await createExpense(expenseData);
      setExpenses(prev => {
        const updated = [newExpense, ...prev];
        updated.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
        return updated;
      });
      return { success: true, data: newExpense };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await updateExpense(id, expenseData);
      setExpenses(prev => {
        const updated = prev.map(e => e.id === id ? updatedExpense : e);
        updated.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
        return updated;
      });
      return { success: true, data: updatedExpense };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    expenses,
    loading,
    error,
    createExpense: handleCreateExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    refreshExpenses: fetchExpenses
  };
}
