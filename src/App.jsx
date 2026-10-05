import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login/Login';

import DailyRoutines from './pages/personalization/DailyRoutines';
import WeeklyRoutines from './pages/personalization/WeeklyRoutines';
import DailyOutfits from './pages/personalization/DailyOutfits';
import Wishlist from './pages/personalization/Wishlist';
import ToGive from './pages/personalization/ToGive';
import ToGet from './pages/personalization/ToGet';
import Credentials from './pages/personalization/Credentials';
import Documents from './pages/personalization/Documents';
import ImportantNotes from './pages/personalization/ImportantNotes';

import DailyNotes from './pages/professional/DailyNotes';
import Attendance from './pages/professional/Attendance';

import ExpenseTracker from './pages/finance/ExpenseTracker';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/personalization/daily-routines" replace />} />
            <Route path="personalization">
              <Route path="daily-routines" element={<DailyRoutines />} />
              <Route path="weekly-routines" element={<WeeklyRoutines />} />
              <Route path="daily-outfits" element={<DailyOutfits />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="to-give" element={<ToGive />} />
              <Route path="to-get" element={<ToGet />} />
              <Route path="credentials" element={<Credentials />} />
              <Route path="documents" element={<Documents />} />
              <Route path="important-notes" element={<ImportantNotes />} />
            </Route>
            <Route path="professional">

              <Route path="daily-notes" element={<DailyNotes />} />
              <Route path="attendance" element={<Attendance />} />
            </Route>
            <Route path="finance">
              <Route path="expense-tracker" element={<ExpenseTracker />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
