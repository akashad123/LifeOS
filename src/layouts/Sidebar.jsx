import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
 
  UserCircle, 
  CalendarDays, 
  Calendar, 
  Shirt, 
  Heart, 
  Gift, 
  ShoppingBag, 
  Key, 
  FileText, 
  Briefcase,
  Users,
  StickyNote,
  Clock,
  Wallet,
  IndianRupee,

  ChevronDown,
  ChevronRight,
  X,
  LogOut
} from 'lucide-react';

const navGroups = [
  {
    title: 'Personalization',
    icon: UserCircle,
    children: [
      { title: 'Daily Routines', path: '/personalization/daily-routines', icon: CalendarDays },
      { title: 'Weekly Routines', path: '/personalization/weekly-routines', icon: Calendar },
      { title: 'Daily Outfits', path: '/personalization/daily-outfits', icon: Shirt },
      { title: 'Wishlist', path: '/personalization/wishlist', icon: Heart },
      { title: 'To Give', path: '/personalization/to-give', icon: Gift },
      { title: 'To Get', path: '/personalization/to-get', icon: ShoppingBag },
      { title: 'Credentials', path: '/personalization/credentials', icon: Key },
      { title: 'Documents', path: '/personalization/documents', icon: FileText },
      { title: 'Important Notes', path: '/personalization/important-notes', icon: StickyNote }
    ]
  },

  {
    title: 'Professional',
    icon: Briefcase,
    children: [

      { title: 'Daily Notes', path: '/professional/daily-notes', icon: StickyNote },
      { title: 'Reminders & Attendance', path: '/professional/attendance', icon: Clock }
    ]
  },
  {
    title: 'Finance',
    icon: IndianRupee,
    children: [
      { title: 'Expense Tracker', path: '/finance/expense-tracker', icon: Wallet }
    ]
  }
];

function NavGroup({ group, onClick }) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!group.children) {
    return (
      <NavLink 
        to={group.path}
        end={group.exact}
        onClick={() => { if (window.innerWidth < 1024) onClick(); }}
        className={({ isActive }) => `flex items-center px-4 py-2 my-1 transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-secondary hover:bg-surface hover:text-primary'}`}
      >
        <group.icon className="w-5 h-5 mr-3" />
        <span>{group.title}</span>
      </NavLink>
    );
  }

  return (
    <div className="my-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-secondary hover:text-primary transition-colors focus:outline-none"
      >
        <div className="flex items-center font-medium">
          <group.icon className="w-5 h-5 mr-3" />
          <span>{group.title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      {isOpen && (
        <div className="ml-6 border-l border-border mt-1">
          {group.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={() => { if (window.innerWidth < 1024) onClick(); }}
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm transition-colors ${isActive ? 'text-primary font-medium bg-primary/5 border-r-2 border-primary' : 'text-secondary hover:text-primary hover:bg-surface'}`}
            >
              <child.icon className="w-4 h-4 mr-3 opacity-70" />
              <span>{child.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface shrink-0">
          <span className="text-xl font-bold text-primary tracking-tight">LifeOS</span>
          <button onClick={onClose} className="lg:hidden text-secondary hover:text-primary p-1">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group, idx) => (
            <NavGroup key={idx} group={group} onClick={onClose} />
          ))}
        </nav>
        
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-secondary hover:bg-danger/10 hover:text-danger transition-colors font-medium rounded-none"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
