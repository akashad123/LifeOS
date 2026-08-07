import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    signIn: authService.signIn,
    signOut: authService.signOut
  };
}
