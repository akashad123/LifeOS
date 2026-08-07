import { useState, useEffect, useCallback } from 'react';
import {
  getImportantNotes,
  createImportantNote,
  updateImportantNote,
  deleteImportantNote
} from '../services/importantNotesService';

export function useImportantNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getImportantNotes();
      setNotes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await createImportantNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return { success: true, data: newNote };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleUpdateNote = async (id, noteData) => {
    try {
      const updatedNote = await updateImportantNote(id, noteData);
      // Remove the old version and prepend the newly updated version to reflect updated_at DESC
      setNotes(prev => [updatedNote, ...prev.filter(n => n.id !== id)]);
      return { success: true, data: updatedNote };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteImportantNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    notes,
    loading,
    error,
    createImportantNote: handleCreateNote,
    updateImportantNote: handleUpdateNote,
    deleteImportantNote: handleDeleteNote,
    refreshNotes: fetchNotes
  };
}
