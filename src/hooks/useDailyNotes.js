import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getDailyNotes,
  createDailyNote,
  updateDailyNote,
  deleteDailyNote
} from '../services/dailyNotesService';

export function useDailyNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyNotes();
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

  // Extract unique title suggestions case-insensitively while preserving original display casing and recency
  const titleSuggestions = useMemo(() => {
    const seen = new Set();
    const unique = [];
    for (const note of notes) {
      if (typeof note?.title === 'string') {
        const trimmed = note.title.trim();
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
  }, [notes]);

  const addNote = async (noteData) => {
    try {
      const newNote = await createDailyNote(noteData);
      setNotes(prev => {
        const newArray = [...prev, newNote];
        return newArray.sort((a, b) => new Date(b.note_date) - new Date(a.note_date));
      });
      return { success: true, data: newNote };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editNote = async (id, noteData) => {
    try {
      const updatedNote = await updateDailyNote(id, noteData);
      setNotes(prev => {
        const newArray = prev.map(n => n.id === id ? updatedNote : n);
        return newArray.sort((a, b) => new Date(b.note_date) - new Date(a.note_date));
      });
      return { success: true, data: updatedNote };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeNote = async (id) => {
    try {
      await deleteDailyNote(id);
      setNotes(prev => prev.filter(o => o.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    notes,
    titleSuggestions,
    suggestions: { titles: titleSuggestions },
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    refreshNotes: fetchNotes
  };
}
