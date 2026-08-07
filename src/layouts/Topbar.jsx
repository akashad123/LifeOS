import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {

  '/personalization/daily-routines': 'Daily Routines',
  '/personalization/weekly-routines': 'Weekly Routines',
  '/personalization/daily-outfits': 'Daily Outfits',
  '/personalization/wishlist': 'Wishlist',
  '/personalization/to-give': 'To Give',
  '/personalization/to-get': 'To Get',
  '/personalization/credentials': 'Credentials',
  '/personalization/documents': 'Documents',
  '/personalization/important-notes': 'Important Notes',
  '/personalization/trips': 'Annual Trips',

  '/professional/daily-notes': 'Daily Notes',
  '/professional/attendance': 'Reminders & Attendance'
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'LifeOS';

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-4 lg:px-8 shrink-0">
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 mr-2 text-secondary hover:text-primary focus:outline-none"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-primary">{currentTitle}</h2>
      </div>
    </header>
  );
}
