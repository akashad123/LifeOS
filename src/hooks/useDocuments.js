import { useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  createDocumentSignedUrl
} from '../services/documentsService';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocuments();
      setDocuments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = async (metadata, file) => {
    try {
      const newDoc = await createDocument(metadata, file);
      setDocuments(prev => [newDoc, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editDocument = async (id, metadata) => {
    try {
      const updatedDoc = await updateDocument(id, metadata);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDoc : doc));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeDocument = async (document) => {
    try {
      await deleteDocument(document);
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getSignedUrl = async (filePath) => {
    try {
      const url = await createDocumentSignedUrl(filePath);
      return { success: true, url };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    documents,
    loading,
    error,
    addDocument,
    editDocument,
    removeDocument,
    getSignedUrl,
    refreshDocuments: fetchDocuments
  };
}
