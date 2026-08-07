import { useState, useEffect, useCallback } from 'react';
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip
} from '../services/annualTripsService';

export function useAnnualTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrips();
      setTrips(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const addTrip = async (tripData) => {
    try {
      const newTrip = await createTrip(tripData);
      setTrips(prev => [newTrip, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editTrip = async (id, tripData) => {
    try {
      const updatedTrip = await updateTrip(id, tripData);
      setTrips(prev => prev.map(trip => trip.id === id ? updatedTrip : trip));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeTrip = async (id) => {
    try {
      await deleteTrip(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    trips,
    loading,
    error,
    addTrip,
    editTrip,
    removeTrip,
    refreshTrips: fetchTrips
  };
}
